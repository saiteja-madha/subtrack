import { DatabaseSync, type SQLInputValue } from "node:sqlite";

import type { Db, DbParams } from "@/db/database";

/**
 * Adapts Node's built-in `node:sqlite` to the app's Db interface so domain
 * SQL, migrations and repositories can be exercised in tests against a real
 * SQLite engine. Not used at runtime on device.
 */
export function createNodeDatabase(path: string = ":memory:"): Db {
  const db = new DatabaseSync(path);

  function toParams(params?: DbParams): SQLInputValue[] {
    if (params == null) return [];
    if (Array.isArray(params)) return params as SQLInputValue[];
    throw new Error("Named parameters are not supported by the node adapter");
  }

  return {
    async execAsync(source: string) {
      db.exec(source);
    },
    async getFirstAsync<T>(source: string, params?: DbParams): Promise<T | null> {
      const row = db.prepare(source).get(...toParams(params));
      return (row ?? null) as T | null;
    },
    async getAllAsync<T>(source: string, params?: DbParams): Promise<T[]> {
      return db.prepare(source).all(...toParams(params)) as T[];
    },
    async runAsync(source: string, params?: DbParams) {
      const info = db.prepare(source).run(...toParams(params));
      return {
        lastInsertRowId: Number(info.lastInsertRowid),
        changes: Number(info.changes),
      };
    },
    async withTransactionAsync(task: () => Promise<void>) {
      db.exec("BEGIN");
      try {
        await task();
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    async close() {
      db.close();
    },
  };
}
