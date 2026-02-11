import { uuid } from '../utils/uuid';
import { getDatabase } from './connection';

const DEFAULT_EXPENSE_CATEGORIES = [
    { name: 'Food & Dining', icon: '🍕', color: '#FF7043' },
    { name: 'Transportation', icon: '🚗', color: '#42A5F5' },
    { name: 'Shopping', icon: '🛍️', color: '#AB47BC' },
    { name: 'Entertainment', icon: '🎬', color: '#EC407A' },
    { name: 'Bills & Utilities', icon: '💡', color: '#FFA726' },
    { name: 'Health', icon: '🏥', color: '#EF5350' },
    { name: 'Education', icon: '📚', color: '#5C6BC0' },
    { name: 'Travel', icon: '✈️', color: '#26A69A' },
    { name: 'Groceries', icon: '🛒', color: '#66BB6A' },
    { name: 'Personal Care', icon: '💇', color: '#F48FB1' },
    { name: 'Gifts', icon: '🎁', color: '#CE93D8' },
    { name: 'Other', icon: '📦', color: '#90A4AE' },
];

const DEFAULT_INCOME_CATEGORIES = [
    { name: 'Salary', icon: '💰', color: '#66BB6A' },
    { name: 'Freelance', icon: '💻', color: '#42A5F5' },
    { name: 'Investment', icon: '📈', color: '#26A69A' },
    { name: 'Gift', icon: '🎁', color: '#CE93D8' },
    { name: 'Refund', icon: '🔄', color: '#FFA726' },
    { name: 'Other Income', icon: '💵', color: '#90A4AE' },
];

const DEFAULT_PAYMENT_METHODS = [
    { name: 'Cash', icon: '💵', isDefault: true },
    { name: 'Credit Card', icon: '💳', isDefault: false },
    { name: 'Debit Card', icon: '🏧', isDefault: false },
    { name: 'UPI', icon: '📱', isDefault: false },
    { name: 'Bank Transfer', icon: '🏦', isDefault: false },
    { name: 'Wallet', icon: '👛', isDefault: false },
];

export async function seedDefaults(): Promise<void> {
    const db = await getDatabase();

    // Check if already seeded
    const existing = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM category'
    );
    if (existing && existing.count > 0) return;

    // Seed expense categories
    for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
        await db.runAsync(
            'INSERT INTO category (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, ?)',
            [uuid(), cat.name, cat.icon, cat.color, 'expense', 1]
        );
    }

    // Seed income categories
    for (const cat of DEFAULT_INCOME_CATEGORIES) {
        await db.runAsync(
            'INSERT INTO category (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, ?)',
            [uuid(), cat.name, cat.icon, cat.color, 'income', 1]
        );
    }

    // Seed payment methods
    for (const pm of DEFAULT_PAYMENT_METHODS) {
        await db.runAsync(
            'INSERT INTO payment_method (id, name, icon, is_default) VALUES (?, ?, ?, ?)',
            [uuid(), pm.name, pm.icon, pm.isDefault ? 1 : 0]
        );
    }
}

export async function getCategoryIdByName(name: string): Promise<string | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM category WHERE name = ?',
        [name]
    );
    return row?.id ?? null;
}

export async function getPaymentMethodIdByName(name: string): Promise<string | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM payment_method WHERE name = ?',
        [name]
    );
    return row?.id ?? null;
}
