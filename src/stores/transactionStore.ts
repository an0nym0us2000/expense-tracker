import { create } from 'zustand';
import { transactionRepo } from '../database';
import type {
    TransactionWithCategory,
    TransactionInput,
    MonthSummary,
    CategoryBreakdown,
    DailySpending,
} from '../types';
import { getCurrentMonth, getCurrentYear } from '../utils';

interface TransactionStore {
    transactions: TransactionWithCategory[];
    recentTransactions: TransactionWithCategory[];
    monthSummary: MonthSummary;
    categoryBreakdown: CategoryBreakdown[];
    dailySpending: DailySpending[];
    selectedMonth: number;
    selectedYear: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadTransactions: () => Promise<void>;
    loadRecentTransactions: () => Promise<void>;
    loadMonthSummary: () => Promise<void>;
    loadCategoryBreakdown: (type?: 'income' | 'expense') => Promise<void>;
    loadDailySpending: () => Promise<void>;
    loadAll: () => Promise<void>;
    addTransaction: (input: TransactionInput) => Promise<void>;
    updateTransaction: (id: string, input: Partial<TransactionInput>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    setMonth: (month: number, year: number) => void;
    nextMonth: () => void;
    prevMonth: () => void;
}

const emptyMonthSummary: MonthSummary = {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: 0,
};

export const useTransactionStore = create<TransactionStore>((set, get) => ({
    transactions: [],
    recentTransactions: [],
    monthSummary: emptyMonthSummary,
    categoryBreakdown: [],
    dailySpending: [],
    selectedMonth: getCurrentMonth(),
    selectedYear: getCurrentYear(),
    isLoading: false,
    error: null,

    loadTransactions: async () => {
        try {
            const { selectedMonth, selectedYear } = get();
            const transactions = await transactionRepo.getByMonth(selectedMonth, selectedYear);
            set({ transactions });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    loadRecentTransactions: async () => {
        try {
            const recentTransactions = await transactionRepo.getRecentTransactions(5);
            set({ recentTransactions });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    loadMonthSummary: async () => {
        try {
            const { selectedMonth, selectedYear } = get();
            const monthSummary = await transactionRepo.getMonthSummary(selectedMonth, selectedYear);
            set({ monthSummary });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    loadCategoryBreakdown: async (type = 'expense') => {
        try {
            const { selectedMonth, selectedYear } = get();
            const categoryBreakdown = await transactionRepo.getCategoryBreakdown(selectedMonth, selectedYear, type);
            set({ categoryBreakdown });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    loadDailySpending: async () => {
        try {
            const { selectedMonth, selectedYear } = get();
            const dailySpending = await transactionRepo.getDailySpending(selectedMonth, selectedYear);
            set({ dailySpending });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    loadAll: async () => {
        set({ isLoading: true, error: null });
        try {
            await Promise.all([
                get().loadTransactions(),
                get().loadRecentTransactions(),
                get().loadMonthSummary(),
                get().loadCategoryBreakdown(),
                get().loadDailySpending(),
            ]);
        } finally {
            set({ isLoading: false });
        }
    },

    addTransaction: async (input) => {
        try {
            await transactionRepo.create(input);
            await get().loadAll();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updateTransaction: async (id, input) => {
        try {
            await transactionRepo.update(id, input);
            await get().loadAll();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deleteTransaction: async (id) => {
        try {
            await transactionRepo.delete(id);
            await get().loadAll();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    setMonth: (month, year) => {
        set({ selectedMonth: month, selectedYear: year });
    },

    nextMonth: () => {
        const { selectedMonth, selectedYear } = get();
        if (selectedMonth === 12) {
            set({ selectedMonth: 1, selectedYear: selectedYear + 1 });
        } else {
            set({ selectedMonth: selectedMonth + 1 });
        }
    },

    prevMonth: () => {
        const { selectedMonth, selectedYear } = get();
        if (selectedMonth === 1) {
            set({ selectedMonth: 12, selectedYear: selectedYear - 1 });
        } else {
            set({ selectedMonth: selectedMonth - 1 });
        }
    },
}));
