// ─── Base Types ───────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD';

export type ThemeMode = 'light' | 'dark' | 'system';

// ─── Database Models ──────────────────────────────────────

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    currency: CurrencyCode;
    createdAt: string;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    categoryId: string;
    date: string;
    note: string;
    paymentMethodId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: TransactionType;
    isDefault: boolean;
}

export interface Budget {
    id: string;
    month: number;
    year: number;
    categoryId: string;
    limitAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Goal {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    icon?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    isDefault: boolean;
}

// ─── Joined/Computed Types ────────────────────────────────

export interface TransactionWithCategory extends Transaction {
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
}

export interface BudgetWithCategory extends Budget {
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    spent: number;
}

// ─── Form / Input Types ───────────────────────────────────

export interface TransactionInput {
    type: TransactionType;
    amount: number;
    categoryId: string;
    date: string;
    note: string;
    paymentMethodId: string;
}

export interface BudgetInput {
    month: number;
    year: number;
    categoryId: string;
    limitAmount: number;
}

export interface GoalInput {
    title: string;
    targetAmount: number;
    currentAmount?: number;
    deadline?: string;
    icon?: string;
}

export interface CategoryInput {
    name: string;
    icon: string;
    color: string;
    type: TransactionType;
    isDefault: boolean;
}

export interface UserProfileInput {
    name: string;
    email: string;
    currency: CurrencyCode;
}

// ─── App Settings ─────────────────────────────────────────

export interface AppSettings {
    currency: CurrencyCode;
    theme: ThemeMode;
    onboardingCompleted: boolean;
    demoMode: boolean;
    notificationsEnabled: boolean;
}

// ─── Analytics / Aggregates ───────────────────────────────

export interface MonthSummary {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
}

export interface CategoryBreakdown {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    amount: number;
    percentage: number;
    count: number;
    transactionCount: number;
}

export interface DailySpending {
    date: string;
    amount: number;
}

export interface MonthlyTrend {
    month: number;
    year: number;
    income: number;
    expense: number;
}
