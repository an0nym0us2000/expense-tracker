import { z } from 'zod';

export const transactionSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z.number().positive('Amount must be positive'),
    categoryId: z.string().min(1, 'Category is required'),
    date: z.string().min(1, 'Date is required'),
    note: z.string().default(''),
    paymentMethodId: z.string().min(1, 'Payment method is required'),
});

export const budgetSchema = z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2020).max(2100),
    categoryId: z.string().min(1, 'Category is required'),
    limitAmount: z.number().positive('Budget limit must be positive'),
});

export const goalSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    targetAmount: z.number().positive('Target amount must be positive'),
    currentAmount: z.number().min(0).default(0),
    deadline: z.string().min(1, 'Deadline is required'),
});

export const userProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']),
});

export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    icon: z.string().min(1, 'Icon is required'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color'),
    type: z.enum(['income', 'expense']),
    isDefault: z.boolean().default(false),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
