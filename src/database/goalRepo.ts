import { uuid } from '../utils/uuid';
import { getDatabase } from './connection';
import type { Goal, GoalInput } from '../types';

function mapRow(row: any): Goal {
    return {
        id: row.id,
        title: row.title,
        targetAmount: row.target_amount,
        currentAmount: row.current_amount,
        deadline: row.deadline,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export const goalRepo = {
    async create(input: GoalInput): Promise<Goal> {
        const db = await getDatabase();
        const id = uuid();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO goal (id, title, target_amount, current_amount, deadline, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, input.title, input.targetAmount, input.currentAmount || 0, input.deadline || null, now, now]
        );

        return {
            id,
            title: input.title,
            targetAmount: input.targetAmount,
            currentAmount: input.currentAmount || 0,
            deadline: input.deadline || '',
            icon: input.icon,
            createdAt: now,
            updatedAt: now
        };
    },

    async update(id: string, input: Partial<GoalInput>): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        const fields: string[] = [];
        const values: any[] = [];

        if (input.title !== undefined) { fields.push('title = ?'); values.push(input.title); }
        if (input.targetAmount !== undefined) { fields.push('target_amount = ?'); values.push(input.targetAmount); }
        if (input.currentAmount !== undefined) { fields.push('current_amount = ?'); values.push(input.currentAmount); }
        if (input.deadline !== undefined) { fields.push('deadline = ?'); values.push(input.deadline); }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(`UPDATE goal SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM goal WHERE id = ?', [id]);
    },

    async getById(id: string): Promise<Goal | null> {
        const db = await getDatabase();
        const row = await db.getFirstAsync('SELECT * FROM goal WHERE id = ?', [id]);
        return row ? mapRow(row) : null;
    },

    async getAll(): Promise<Goal[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync('SELECT * FROM goal ORDER BY deadline ASC');
        return rows.map(mapRow);
    },

    async addFunds(id: string, amount: number): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        await db.runAsync(
            'UPDATE goal SET current_amount = current_amount + ?, updated_at = ? WHERE id = ?',
            [amount, now, id]
        );
    },
};
