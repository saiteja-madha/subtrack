import type { Db } from "@/db/database";
import { migration001Initial } from "@/db/migrations/001_initial";

export interface Migration {
  version: number;
  name: string;
  up: (db: Db) => Promise<void>;
}

export const MIGRATIONS: Migration[] = [{ version: 1, name: "initial", up: migration001Initial }];

/**
 * Applies pending migrations inside transactions and records them in
 * `schema_migrations`. Safe to call on every launch.
 */
export async function runMigrations(db: Db): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    (await db.getAllAsync<{ version: number }>("SELECT version FROM schema_migrations")).map(
      (row) => row.version,
    ),
  );

  const sorted = [...MIGRATIONS].sort((a, b) => a.version - b.version);
  for (const migration of sorted) {
    if (applied.has(migration.version)) continue;
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.runAsync(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)",
        [migration.version, migration.name, new Date().toISOString()],
      );
    });
  }
}
