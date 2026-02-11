import { transactionSchema, budgetSchema, goalSchema, userProfileSchema } from '../src/validation/schemas';

describe('Validation Schemas', () => {
    describe('transactionSchema', () => {
        test('validates valid expense', () => {
            const result = transactionSchema.safeParse({
                type: 'expense',
                amount: 42.50,
                categoryId: 'cat-1',
                date: '2024-01-15',
                note: 'Lunch',
                paymentMethodId: 'pm-1',
            });
            expect(result.success).toBe(true);
        });

        test('rejects negative amount', () => {
            const result = transactionSchema.safeParse({
                type: 'expense',
                amount: -10,
                categoryId: 'cat-1',
                date: '2024-01-15',
                paymentMethodId: 'pm-1',
            });
            expect(result.success).toBe(false);
        });

        test('rejects empty categoryId', () => {
            const result = transactionSchema.safeParse({
                type: 'expense',
                amount: 10,
                categoryId: '',
                date: '2024-01-15',
                paymentMethodId: 'pm-1',
            });
            expect(result.success).toBe(false);
        });

        test('rejects invalid type', () => {
            const result = transactionSchema.safeParse({
                type: 'transfer',
                amount: 10,
                categoryId: 'cat-1',
                date: '2024-01-15',
                paymentMethodId: 'pm-1',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('budgetSchema', () => {
        test('validates valid budget', () => {
            const result = budgetSchema.safeParse({
                month: 6,
                year: 2024,
                categoryId: 'cat-1',
                limitAmount: 500,
            });
            expect(result.success).toBe(true);
        });

        test('rejects month 0', () => {
            const result = budgetSchema.safeParse({
                month: 0,
                year: 2024,
                categoryId: 'cat-1',
                limitAmount: 500,
            });
            expect(result.success).toBe(false);
        });

        test('rejects month 13', () => {
            const result = budgetSchema.safeParse({
                month: 13,
                year: 2024,
                categoryId: 'cat-1',
                limitAmount: 500,
            });
            expect(result.success).toBe(false);
        });
    });

    describe('goalSchema', () => {
        test('validates valid goal', () => {
            const result = goalSchema.safeParse({
                title: 'Emergency Fund',
                targetAmount: 10000,
                currentAmount: 500,
                deadline: '2025-12-31',
            });
            expect(result.success).toBe(true);
        });

        test('rejects empty title', () => {
            const result = goalSchema.safeParse({
                title: '',
                targetAmount: 10000,
                deadline: '2025-12-31',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('userProfileSchema', () => {
        test('validates valid profile', () => {
            const result = userProfileSchema.safeParse({
                name: 'John Doe',
                email: 'john@example.com',
                currency: 'USD',
            });
            expect(result.success).toBe(true);
        });

        test('rejects invalid email', () => {
            const result = userProfileSchema.safeParse({
                name: 'John Doe',
                email: 'not-an-email',
                currency: 'USD',
            });
            expect(result.success).toBe(false);
        });

        test('rejects invalid currency', () => {
            const result = userProfileSchema.safeParse({
                name: 'John Doe',
                email: 'john@example.com',
                currency: 'BTC',
            });
            expect(result.success).toBe(false);
        });
    });
});
