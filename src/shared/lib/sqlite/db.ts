import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const dataDir = process.env.PONDFLOW_DATA_DIR || path.join(process.cwd(), "data");
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
if (!isBuild) mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(isBuild ? ":memory:" : path.join(dataDir, "pondflow.sqlite"));
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.exec(readFileSync(path.join(process.cwd(), "src/shared/lib/sqlite/schema.sql"), "utf8"));
try { sqlite.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','superadmin'))"); } catch { /* column already exists */ }

type Filter = { sql: string; params: unknown[] };

function safeIdentifier(value: string) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) throw new Error(`Invalid SQL identifier: ${value}`);
  return value;
}

function toSqlValue(value: unknown) {
  if (value !== null && typeof value === "object") return JSON.stringify(value);
  return value;
}

class Query<T = any> implements PromiseLike<{ data: T[] | null; error: Error | null; count?: number }> {
  private columns = "*";
  private filters: Filter[] = [];
  private orderBy?: { column: string; ascending: boolean };
  private limitValue?: number;
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private values: Record<string, unknown> = {};
  private countExact = false;
  private returnRows = false;

  constructor(private readonly table: string) { safeIdentifier(table); }

  select(columns = "*", options?: { count?: "exact" }) { this.columns = columns || "*"; this.countExact = options?.count === "exact"; this.returnRows = true; return this; }
  insert(values: Record<string, unknown> | Record<string, unknown>[]) { this.mode = "insert"; this.values = Array.isArray(values) ? values[0] : values; return this; }
  update(values: Record<string, unknown>) { this.mode = "update"; this.values = values; return this; }
  delete() { this.mode = "delete"; return this; }
  eq(column: string, value: unknown) { this.filters.push({ sql: `${safeIdentifier(column)} = ?`, params: [value] }); return this; }
  in(column: string, values: unknown[]) { this.filters.push(values.length ? { sql: `${safeIdentifier(column)} IN (${values.map(() => "?").join(",")})`, params: values } : { sql: "1 = 0", params: [] }); return this; }
  gte(column: string, value: unknown) { this.filters.push({ sql: `${safeIdentifier(column)} >= ?`, params: [value] }); return this; }
  lte(column: string, value: unknown) { this.filters.push({ sql: `${safeIdentifier(column)} <= ?`, params: [value] }); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orderBy = { column: safeIdentifier(column), ascending: options?.ascending !== false }; return this; }
  limit(value: number) { this.limitValue = value; return this; }
  single() { this.limitValue = 1; return this.then((result) => ({ ...result, data: (result.data?.[0] ?? null) as T | null })); }
  maybeSingle() { this.limitValue = 1; return this.then((result) => ({ ...result, data: (result.data?.[0] ?? null) as T | null })); }

  private where() { return this.filters.length ? ` WHERE ${this.filters.map((f) => f.sql).join(" AND ")}` : ""; }
  private execute() {
    const params = this.filters.flatMap((f) => f.params);
    if (this.mode === "insert") {
      const row: Record<string, unknown> = { id: randomUUID(), created_at: new Date().toISOString(), ...this.values };
      const keys = Object.keys(row).map(safeIdentifier);
      sqlite.prepare(`INSERT INTO ${this.table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`).run(...keys.map((key) => toSqlValue(row[key])));
      const inserted = sqlite.prepare(`SELECT * FROM ${this.table} WHERE id = ?`).all(row.id) as T[];
      return { data: this.returnRows ? inserted : null, error: null };
    }
    if (this.mode === "update") {
      const keys = Object.keys(this.values).map(safeIdentifier);
      const updateParams = keys.map((key) => this.values[key]);
      sqlite.prepare(`UPDATE ${this.table} SET ${keys.map((key) => `${key} = ?`).join(",")}${this.where()}`).run(...updateParams, ...params);
      return { data: null, error: null };
    }
    if (this.mode === "delete") { sqlite.prepare(`DELETE FROM ${this.table}${this.where()}`).run(...params); return { data: null, error: null }; }
    const columns = this.columns === "*" ? "*" : this.columns.split(",").map((c) => safeIdentifier(c.trim())).join(",");
    const order = this.orderBy ? ` ORDER BY ${this.orderBy.column} ${this.orderBy.ascending ? "ASC" : "DESC"}` : "";
    const limit = this.limitValue === undefined ? "" : ` LIMIT ${Math.max(0, Math.floor(this.limitValue))}`;
    const data = sqlite.prepare(`SELECT ${columns} FROM ${this.table}${this.where()}${order}${limit}`).all(...params) as T[];
    const count = this.countExact ? (sqlite.prepare(`SELECT COUNT(*) as count FROM ${this.table}${this.where()}`).get(...params) as { count: number }).count : undefined;
    return { data, error: null, ...(count === undefined ? {} : { count }) };
  }

  then<TResult1 = { data: T[] | null; error: Error | null; count?: number }, TResult2 = never>(onfulfilled?: ((value: { data: T[] | null; error: Error | null; count?: number }) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) {
    try { return Promise.resolve(this.execute()).then(onfulfilled, onrejected); } catch (error) { return Promise.resolve({ data: null, error: error as Error }).then(onfulfilled, onrejected); }
  }
}

export function db() { return { from: <T = any>(table: string) => new Query<T>(table) }; }
export { sqlite };
