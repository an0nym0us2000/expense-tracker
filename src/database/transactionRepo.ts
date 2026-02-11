import { uuid } from '../utils/uuid';
import { getDatabase } from './connection';
import type { Transaction, TransactionInput, TransactionWithCategory } from '../types';

function mapRow(row: any): Transaction {
    return {
        id: row.id,
        type: row.type,
        amount: row.amount,
        categoryId: row.category_id,
        date: row.date,
        note: row.note,
        paymentMethodId: row.payment_method_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapWithCategory(row: any): TransactionWithCategory {
    return {
        ...mapRow(row),
        categoryName: row.category_name,
        categoryIcon: row.category_icon,
        categoryColor: row.category_color,
    };
}

export const transactionRepo = {
    async create(input: TransactionInput): Promise<Transaction> {
        const db = await getDatabase();
        const id = uuid();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO "transaction" (id, type, amount, category_id, date, note, payment_method_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, input.type, input.amount, input.categoryId, input.date, input.note, input.paymentMethodId, now, now]
        );

        return { id, ...input, createdAt: now, updatedAt: now };
    },

    async update(id: string, input: Partial<TransactionInput>): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        const fields: string[] = [];
        const values: any[] = [];

        if (input.type !== undefined) { fields.push('type = ?'); values.push(input.type); }
        if (input.amount !== undefined) { fields.push('amount = ?'); values.push(input.amount); }
        if (input.categoryId !== undefined) { fields.push('category_id = ?'); values.push(input.categoryId); }
        if (input.date !== undefined) { fields.push('date = ?'); values.push(input.date); }
        if (input.note !== undefined) { fields.push('note = ?'); values.push(input.note); }
        if (input.paymentMethodId !== undefined) { fields.push('payment_method_id = ?'); values.push(input.paymentMethodId); }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
            `UPDATE "transaction" SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
    },

    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM "transaction" WHERE id = ?', [id]);
    },

    async getById(id: string): Promise<TransactionWithCategory | null> {
        const db = await getDatabase();
        const row = await db.getFirstAsync(
            `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM "transaction" t
       LEFT JOIN category c ON t.category_id = c.id
       WHERE t.id = ?`,
            [id]
        );
        return row ? mapWithCategory(row) : null;
    },

    async getAll(limit = 50, offset = 0): Promise<TransactionWithCategory[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync(
            `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM "transaction" t
       LEFT JOIN category c ON t.category_id = c.id
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows.map(mapWithCategory);
    },

    async getByDateRange(startDate: string, endDate: string): Promise<TransactionWithCategory[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync(
            `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM "transaction" t
       LEFT JOIN category c ON t.category_id = c.id
       WHERE t.date >= ? AND t.date <= ?
       ORDER BY t.date DESC, t.created_at DESC`,
            [startDate, endDate]
        );
        return rows.map(mapWithCategory);
    },

    async getByMonth(month: number, year: number): Promise<TransactionWithCategory[]> {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
        return this.getByDateRange(startDate, endDate);
    },

    async getMonthSummary(month: number, year: number) {
        const db = await getDatabase();
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        const row = await db.getFirstAsync<{
            total_income: number;
            total_expense: number;
            tx_count: number;
        }>(
            `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as tx_count
       FROM "transaction"
       WHERE date >= ? AND date <= ?`,
            [startDate, endDate]
        );

        return {
            totalIncome: row?.total_income ?? 0,
            totalExpense: row?.total_expense ?? 0,
            netBalance: (row?.total_income ?? 0) - (row?.total_expense ?? 0),
            transactionCount: row?.tx_count ?? 0,
        };
    },

    async getCategoryBreakdown(month: number, year: number, type: 'income' | 'expense' = 'expense') {
        const db = await getDatabase();
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        const rows = await db.getAllAsync<{
            category_id: string;
            category_name: string;
            category_icon: string;
            category_color: string;
            total: number;
            count: number;
        }>(
            `SELECT c.id as category_id, c.name as category_name, c.icon as category_icon,
              c.color as category_color, SUM(t.amount) as total, COUNT(*) as count
       FROM "transaction" t
       JOIN category c ON t.category_id = c.id
       WHERE t.date >= ? AND t.date <= ? AND t.type = ?
       GROUP BY c.id
       ORDER BY total DESC`,
            [startDate, endDate, type]
        );

        const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

        return rows.map((r) => ({
            categoryId: r.category_id,
            categoryName: r.category_name,
            categoryIcon: r.category_icon,
            categoryColor: r.category_color,
            amount: r.total,
            percentage: grandTotal > 0 ? (r.total / grandTotal) * 100 : 0,
            count: r.count,
            transactionCount: r.count,
        }));
    },

    async getDailySpending(month: number, year: number) {
        const db = await getDatabase();
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        const rows = await db.getAllAsync<{ date: string; total: number }>(
            `SELECT date, SUM(amount) as total
       FROM "transaction"
       WHERE date >= ? AND date <= ? AND type = 'expense'
       GROUP BY date
       ORDER BY date ASC`,
            [startDate, endDate]
        );

        return rows.map((r) => ({ date: r.date, amount: r.total }));
    },

    async getRecentTransactions(limit = 5): Promise<TransactionWithCategory[]> {
        return this.getAll(limit, 0);
    },

    async getCount(): Promise<number> {
        const db = await getDatabase();
        const row = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM "transaction"'
        );
        return row?.count ?? 0;
    },

    async getSpentByCategory(categoryId: string, month: number, year: number): Promise<number> {
        const db = await getDatabase();
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        const row = await db.getFirstAsync<{ total: number }>(
            `SELECT COALESCE(SUM(amount), 0) as total FROM "transaction"
       WHERE category_id = ? AND date >= ? AND date <= ? AND type = 'expense'`,
            [categoryId, startDate, endDate]
        );
        return row?.total ?? 0;
    },
};
