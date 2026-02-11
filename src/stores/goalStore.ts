import { create } from 'zustand';
import { goalRepo } from '../database';
import type { Goal, GoalInput } from '../types';

interface GoalStore {
    goals: Goal[];
    isLoading: boolean;
    error: string | null;

    loadGoals: () => Promise<void>;
    addGoal: (input: GoalInput) => Promise<void>;
    updateGoal: (id: string, input: Partial<GoalInput>) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addFunds: (id: string, amount: number) => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
    goals: [],
    isLoading: false,
    error: null,

    loadGoals: async () => {
        set({ isLoading: true, error: null });
        try {
            const goals = await goalRepo.getAll();
            set({ goals });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },

    addGoal: async (input) => {
        try {
            await goalRepo.create(input);
            await get().loadGoals();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updateGoal: async (id, input) => {
        try {
            await goalRepo.update(id, input);
            await get().loadGoals();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deleteGoal: async (id) => {
        try {
            await goalRepo.delete(id);
            await get().loadGoals();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    addFunds: async (id, amount) => {
        try {
            await goalRepo.addFunds(id, amount);
            await get().loadGoals();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },
}));
