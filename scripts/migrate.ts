import fs from "fs";
import path from "path";
import { getSqlite } from "../src/db";

const migrationsDir = path.join(process.cwd(), "drizzle");

function runMigrations() {
  const sqlite = getSqlite();
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  if (!fs.existsSync(migrationsDir)) {
    console.log("No drizzle/ folder — run npm run db:generate first.");
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const hash = file;
    const existing = sqlite
      .prepare("SELECT 1 FROM __drizzle_migrations WHERE hash = ?")
      .get(hash);
    if (existing) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = sql
      .split(/--> statement-breakpoint/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      sqlite.exec(stmt);
    }
    sqlite.prepare("INSERT INTO __drizzle_migrations (hash) VALUES (?)").run(hash);
    console.log(`Applied ${file}`);
  }

  console.log("Migrations complete.");
}

runMigrations();
