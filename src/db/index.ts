import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

function resolveDbPath(): string {
  const url = process.env.DATABASE_URL ?? "file:./data/rental.db";
  const filePath = url.startsWith("file:") ? url.slice(5) : url;
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
}

let sqlite: Database.Database | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!dbInstance) {
    const dbPath = resolveDbPath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    dbInstance = drizzle(sqlite, { schema });
  }
  return dbInstance;
}

export function getSqlite() {
  getDb();
  return sqlite!;
}
