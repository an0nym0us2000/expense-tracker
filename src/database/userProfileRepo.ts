import { uuid } from '../utils/uuid';
import { getDatabase } from './connection';
import type { UserProfile, UserProfileInput } from '../types';

function mapRow(row: any): UserProfile {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        currency: row.currency,
        createdAt: row.created_at,
    };
}

export const userProfileRepo = {
    async get(): Promise<UserProfile | null> {
        const db = await getDatabase();
        const row = await db.getFirstAsync('SELECT * FROM user_profile LIMIT 1');
        return row ? mapRow(row) : null;
    },

    async create(input: UserProfileInput): Promise<UserProfile> {
        const db = await getDatabase();
        const id = uuid();
        const now = new Date().toISOString();

        await db.runAsync(
            'INSERT INTO user_profile (id, name, email, currency, created_at) VALUES (?, ?, ?, ?, ?)',
            [id, input.name, input.email, input.currency, now]
        );

        return { id, ...input, createdAt: now };
    },

    async update(input: Partial<UserProfileInput>): Promise<void> {
        const db = await getDatabase();
        const fields: string[] = [];
        const values: any[] = [];

        if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name); }
        if (input.email !== undefined) { fields.push('email = ?'); values.push(input.email); }
        if (input.currency !== undefined) { fields.push('currency = ?'); values.push(input.currency); }

        if (fields.length === 0) return;

        await db.runAsync(
            `UPDATE user_profile SET ${fields.join(', ')} WHERE id = (SELECT id FROM user_profile LIMIT 1)`,
            values
        );
    },

    async exists(): Promise<boolean> {
        const db = await getDatabase();
        const row = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM user_profile'
        );
        return (row?.count ?? 0) > 0;
    },
};
