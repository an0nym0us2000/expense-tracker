import { uuid } from '../utils/uuid';
import { getDatabase } from './connection';
import type { Budget, BudgetInput, BudgetWithCategory } from '../types';
import { transactionRepo } from './transactionRepo';

function mapRow(row: any): Budget {
    return {
        id: row.id,
        month: row.month,
        year: row.year,
        categoryId: row.category_id,
        limitAmount: row.limit_amount,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export const budgetRepo = {
    async create(input: BudgetInput): Promise<Budget> {
        const db = await getDatabase();
        const id = uuid();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO budget (id, month, year, category_id, limit_amount, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, input.month, input.year, input.categoryId, input.limitAmount, now, now]
        );

        return { id, ...input, createdAt: now, updatedAt: now };
    },

    async update(id: string, input: Partial<BudgetInput>): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        const fields: string[] = [];
        const values: any[] = [];

        if (input.month !== undefined) { fields.push('month = ?'); values.push(input.month); }
        if (input.year !== undefined) { fields.push('year = ?'); values.push(input.year); }
        if (input.categoryId !== undefined) { fields.push('category_id = ?'); values.push(input.categoryId); }
        if (input.limitAmount !== undefined) { fields.push('limit_amount = ?'); values.push(input.limitAmount); }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(`UPDATE budget SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM budget WHERE id = ?', [id]);
    },

    async getById(id: string): Promise<Budget | null> {
        const db = await getDatabase();
        const row = await db.getFirstAsync('SELECT * FROM budget WHERE id = ?', [id]);
        return row ? mapRow(row) : null;
    },

    async getByMonthYear(month: number, year: number): Promise<BudgetWithCategory[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync<any>(
            `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM budget b
       LEFT JOIN category c ON b.category_id = c.id
       WHERE b.month = ? AND b.year = ?
       ORDER BY b.limit_amount DESC`,
            [month, year]
        );

        const result: BudgetWithCategory[] = [];
        for (const row of rows) {
            const spent = await transactionRepo.getSpentByCategory(row.category_id, month, year);
            result.push({
                ...mapRow(row),
                categoryName: row.category_name,
                categoryIcon: row.category_icon,
                categoryColor: row.category_color,
                spent,
            });
        }

        return result;
    },

    async getAll(): Promise<Budget[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync('SELECT * FROM budget ORDER BY year DESC, month DESC');
        return rows.map(mapRow);
    },

    async getTotalBudget(month: number, year: number): Promise<number> {
        const db = await getDatabase();
        const row = await db.getFirstAsync<{ total: number }>(
            'SELECT COALESCE(SUM(limit_amount), 0) as total FROM budget WHERE month = ? AND year = ?',
            [month, year]
        );
        return row?.total ?? 0;
    },
};
