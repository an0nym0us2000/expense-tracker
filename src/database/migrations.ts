import { getDatabase } from './connection';

const SCHEMA_VERSION = 1;

const migrations: Record<number, string[]> = {
    1: [
        `CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      currency TEXT NOT NULL DEFAULT 'USD',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );`,

        `CREATE TABLE IF NOT EXISTS category (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '📁',
      color TEXT NOT NULL DEFAULT '#66BB6A',
      type TEXT NOT NULL CHECK(type IN ('income','expense')),
      is_default INTEGER NOT NULL DEFAULT 0
    );`,

        `CREATE TABLE IF NOT EXISTS payment_method (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '💳',
      is_default INTEGER NOT NULL DEFAULT 0
    );`,

        `CREATE TABLE IF NOT EXISTS "transaction" (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income','expense')),
      amount REAL NOT NULL CHECK(amount > 0),
      category_id TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      payment_method_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES category(id),
      FOREIGN KEY (payment_method_id) REFERENCES payment_method(id)
    );`,

        `CREATE TABLE IF NOT EXISTS budget (
      id TEXT PRIMARY KEY NOT NULL,
      month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
      year INTEGER NOT NULL,
      category_id TEXT NOT NULL,
      limit_amount REAL NOT NULL CHECK(limit_amount > 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES category(id),
      UNIQUE(month, year, category_id)
    );`,

        `CREATE TABLE IF NOT EXISTS goal (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      target_amount REAL NOT NULL CHECK(target_amount > 0),
      current_amount REAL NOT NULL DEFAULT 0 CHECK(current_amount >= 0),
      deadline TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );`,

        // Indexes for performance
        `CREATE INDEX IF NOT EXISTS idx_transaction_date ON "transaction"(date);`,
        `CREATE INDEX IF NOT EXISTS idx_transaction_category ON "transaction"(category_id);`,
        `CREATE INDEX IF NOT EXISTS idx_transaction_type ON "transaction"(type);`,
        `CREATE INDEX IF NOT EXISTS idx_budget_month_year ON budget(month, year);`,
    ],
};

export async function runMigrations(): Promise<void> {
    const db = await getDatabase();

    // Create version table
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL DEFAULT 0
    );`
    );

    const row = await db.getFirstAsync<{ version: number }>(
        'SELECT version FROM schema_version LIMIT 1'
    );

    let currentVersion = row?.version ?? 0;

    if (currentVersion === 0 && !row) {
        await db.runAsync('INSERT INTO schema_version (version) VALUES (?)', [0]);
    }

    for (let v = currentVersion + 1; v <= SCHEMA_VERSION; v++) {
        const statements = migrations[v];
        if (!statements) continue;

        for (const sql of statements) {
            await db.execAsync(sql);
        }

        await db.runAsync('UPDATE schema_version SET version = ?', [v]);
        currentVersion = v;
    }
}
