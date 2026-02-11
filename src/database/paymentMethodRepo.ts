import { uuid } from '../utils/uuid';
import { getDatabase } from './connection';
import type { PaymentMethod } from '../types';

function mapRow(row: any): PaymentMethod {
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        isDefault: !!row.is_default,
    };
}

export const paymentMethodRepo = {
    async getAll(): Promise<PaymentMethod[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync('SELECT * FROM payment_method ORDER BY is_default DESC, name ASC');
        return rows.map(mapRow);
    },

    async getById(id: string): Promise<PaymentMethod | null> {
        const db = await getDatabase();
        const row = await db.getFirstAsync('SELECT * FROM payment_method WHERE id = ?', [id]);
        return row ? mapRow(row) : null;
    },

    async create(name: string, icon: string, isDefault = false): Promise<PaymentMethod> {
        const db = await getDatabase();
        const id = uuid();
        await db.runAsync(
            'INSERT INTO payment_method (id, name, icon, is_default) VALUES (?, ?, ?, ?)',
            [id, name, icon, isDefault ? 1 : 0]
        );
        return { id, name, icon, isDefault };
    },

    async update(id: string, data: Partial<{ name: string; icon: string; isDefault: boolean }>): Promise<void> {
        const db = await getDatabase();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
        if (data.isDefault !== undefined) { fields.push('is_default = ?'); values.push(data.isDefault ? 1 : 0); }

        if (fields.length === 0) return;
        values.push(id);

        await db.runAsync(`UPDATE payment_method SET ${fields.join(', ')} WHERE id = ?`, values);
    },

    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM payment_method WHERE id = ?', [id]);
    },
};
