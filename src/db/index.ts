import * as SQLite from "expo-sqlite";

import type { Db } from "@/db/database";
import { runMigrations } from "@/db/migrations";

let dbPromise: Promise<Db> | null = null;

/**
 * Opens (once) the app database, applies pending migrations and returns it.
 * On any failure the promise is cleared so a later call can retry.
 */
export function openDatabase(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const raw = await SQLite.openDatabaseAsync("subtrack.db");
      const db = raw as unknown as Db;
      await runMigrations(db);
      return db;
    })();
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

/** Used by tests and when wiping all data. */
export function resetDatabase(): void {
  dbPromise = null;
}
