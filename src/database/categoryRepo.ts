import { getDatabase } from './connection';
import type { Category, CategoryInput } from '../types';
import { uuid } from '../utils/uuid';

function mapRow(row: any): Category {
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        type: row.type,
        isDefault: !!row.is_default,
    };
}

export const categoryRepo = {
    async getAll(): Promise<Category[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync('SELECT * FROM category ORDER BY is_default DESC, name ASC');
        return rows.map(mapRow);
    },

    async getByType(type: 'income' | 'expense'): Promise<Category[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync(
            'SELECT * FROM category WHERE type = ? ORDER BY is_default DESC, name ASC',
            [type]
        );
        return rows.map(mapRow);
    },

    async getById(id: string): Promise<Category | null> {
        const db = await getDatabase();
        const row = await db.getFirstAsync('SELECT * FROM category WHERE id = ?', [id]);
        return row ? mapRow(row) : null;
    },

    async create(input: CategoryInput): Promise<Category> {
        const db = await getDatabase();
        const id = uuid();
        await db.runAsync(
            'INSERT INTO category (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, ?)',
            [id, input.name, input.icon, input.color, input.type, input.isDefault ? 1 : 0]
        );
        return { id, ...input };
    },

    async update(id: string, input: Partial<CategoryInput>): Promise<void> {
        const db = await getDatabase();
        const fields: string[] = [];
        const values: any[] = [];

        if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name); }
        if (input.icon !== undefined) { fields.push('icon = ?'); values.push(input.icon); }
        if (input.color !== undefined) { fields.push('color = ?'); values.push(input.color); }
        if (input.type !== undefined) { fields.push('type = ?'); values.push(input.type); }
        if (input.isDefault !== undefined) { fields.push('is_default = ?'); values.push(input.isDefault ? 1 : 0); }

        if (fields.length === 0) return;
        values.push(id);

        await db.runAsync(`UPDATE category SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM category WHERE id = ?', [id]);
    },
};
