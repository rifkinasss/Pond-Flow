import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dataDir = process.env.PONDFLOW_DATA_DIR || path.join(process.cwd(), "data");
const backupDir = process.env.PONDFLOW_BACKUP_DIR || path.join(dataDir, "backups");
mkdirSync(backupDir, { recursive: true });
const source = new Database(path.join(dataDir, "pondflow.sqlite"), { readonly: true });
const target = path.join(backupDir, `pondflow-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.sqlite`);
await source.backup(target);
source.close();
console.log(`Backup dibuat: ${target}`);
