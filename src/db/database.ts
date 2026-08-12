export type DbBindValue = string | number | null | boolean | Uint8Array | bigint;
export type DbParams = DbBindValue[] | Record<string, DbBindValue> | null;

export interface DbRunResult {
  lastInsertRowId: number | bigint;
  changes: number | bigint;
}

/**
 * Minimal async database surface used by repositories and migrations.
 * `expo-sqlite`'s SQLiteDatabase satisfies this interface structurally, and a
 * `node:sqlite` adapter is used in tests.
 */
export interface Db {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string, params?: DbParams): Promise<T | null>;
  getAllAsync<T>(source: string, params?: DbParams): Promise<T[]>;
  runAsync(source: string, params?: DbParams): Promise<DbRunResult>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
  close(): Promise<void>;
}
