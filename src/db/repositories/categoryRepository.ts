import type { Db } from "@/db/database";
import { DEFAULT_CATEGORIES } from "@/constants/categories";
import type { Category } from "@/domain/types";

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_default: number;
  created_at: string;
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    sortOrder: row.sort_order,
    isDefault: row.is_default === 1,
  };
}

export async function getAllCategories(db: Db): Promise<Category[]> {
  const rows = await db.getAllAsync<CategoryRow>(
    "SELECT * FROM categories ORDER BY sort_order ASC, name ASC",
  );
  return rows.map(rowToCategory);
}

export async function getCategoryById(db: Db, id: string): Promise<Category | null> {
  const row = await db.getFirstAsync<CategoryRow>("SELECT * FROM categories WHERE id = ?", [id]);
  return row ? rowToCategory(row) : null;
}

export async function createCategory(
  db: Db,
  category: Omit<Category, "isDefault">,
): Promise<Category> {
  await db.runAsync(
    "INSERT INTO categories (id, name, icon, sort_order, is_default, created_at) VALUES (?, ?, ?, ?, 0, ?)",
    [category.id, category.name, category.icon, category.sortOrder, new Date().toISOString()],
  );
  return { ...category, isDefault: false };
}

/** Restores an exact category row during backup import. */
export async function insertCategoryRaw(db: Db, category: Category): Promise<void> {
  await db.runAsync(
    "INSERT INTO categories (id, name, icon, sort_order, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [
      category.id,
      category.name,
      category.icon,
      category.sortOrder,
      category.isDefault ? 1 : 0,
      new Date().toISOString(),
    ],
  );
}

/** Inserts the default categories, skipping any that already exist by id. */
export async function ensureDefaultCategories(db: Db): Promise<void> {
  const existing = await getAllCategories(db);
  const existingIds = new Set(existing.map((c) => c.id));

  const missing = DEFAULT_CATEGORIES.filter((c) => !existingIds.has(c.id));
  if (missing.length === 0) return;

  await db.withTransactionAsync(async () => {
    for (let i = 0; i < missing.length; i += 1) {
      const category = missing[i];
      await db.runAsync(
        "INSERT OR IGNORE INTO categories (id, name, icon, sort_order, is_default, created_at) VALUES (?, ?, ?, ?, 1, ?)",
        [category.id, category.name, category.icon, i, new Date().toISOString()],
      );
    }
  });
}

export async function clearCategories(db: Db): Promise<void> {
  await db.runAsync("DELETE FROM categories");
}
