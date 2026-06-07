export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startGmailCron } = await import("./jobs/sync-gmail");
    const { getDb } = await import("./db");
    getDb();
    const { getSqlite } = await import("./db");
    const sqlite = getSqlite();
    const migrate = await import("../scripts/migrate-inline");
    migrate.runMigrationsInline(sqlite);
    startGmailCron();
  }
}
