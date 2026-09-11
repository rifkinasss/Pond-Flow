import Database from "better-sqlite3";
import path from "node:path";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) { console.error("Usage: npm run admin:promote -- user@example.com"); process.exit(1); }
const dataDir = process.env.PONDFLOW_DATA_DIR || path.join(process.cwd(), "data");
const db = new Database(path.join(dataDir, "pondflow.sqlite"));
const result = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
if (!result.changes) { console.error(`User tidak ditemukan: ${email}`); process.exit(1); }
console.log(`User dipromosikan menjadi admin: ${email}`);
