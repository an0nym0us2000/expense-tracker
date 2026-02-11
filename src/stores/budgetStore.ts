import { create } from 'zustand';
import { budgetRepo } from '../database';
import type { BudgetWithCategory, BudgetInput } from '../types';
import { getCurrentMonth, getCurrentYear } from '../utils';

interface BudgetStore {
    budgets: BudgetWithCategory[];
    totalBudget: number;
    selectedMonth: number;
    selectedYear: number;
    isLoading: boolean;
    error: string | null;

    loadBudgets: (month: number, year: number) => Promise<void>;
    addBudget: (input: BudgetInput) => Promise<void>;
    updateBudget: (id: string, input: Partial<BudgetInput>) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    setMonth: (month: number, year: number) => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
    budgets: [],
    totalBudget: 0,
    selectedMonth: getCurrentMonth(),
    selectedYear: getCurrentYear(),
    isLoading: false,
    error: null,

    loadBudgets: async (month, year) => {
        set({ isLoading: true, error: null, selectedMonth: month, selectedYear: year });
        try {
            const [budgets, totalBudget] = await Promise.all([
                budgetRepo.getByMonthYear(month, year),
                budgetRepo.getTotalBudget(month, year),
            ]);
            set({ budgets, totalBudget });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },

    addBudget: async (input) => {
        try {
            await budgetRepo.create(input);
            const { selectedMonth, selectedYear } = get();
            await get().loadBudgets(selectedMonth, selectedYear);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updateBudget: async (id, input) => {
        try {
            await budgetRepo.update(id, input);
            const { selectedMonth, selectedYear } = get();
            await get().loadBudgets(selectedMonth, selectedYear);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deleteBudget: async (id) => {
        try {
            await budgetRepo.delete(id);
            const { selectedMonth, selectedYear } = get();
            await get().loadBudgets(selectedMonth, selectedYear);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    setMonth: (month, year) => {
        set({ selectedMonth: month, selectedYear: year });
    },
}));
