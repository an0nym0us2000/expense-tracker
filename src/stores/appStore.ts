import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, CurrencyCode, ThemeMode } from '../types';

const SETTINGS_KEY = '@expense_tracker_settings';

const defaultSettings: AppSettings = {
    currency: 'USD',
    theme: 'light',
    onboardingCompleted: false,
    demoMode: true,
    notificationsEnabled: true,
};

interface AppStore {
    settings: AppSettings;
    isLoading: boolean;
    isDbReady: boolean;

    // Actions
    loadSettings: () => Promise<void>;
    updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
    setCurrency: (currency: CurrencyCode) => Promise<void>;
    setTheme: (theme: ThemeMode) => Promise<void>;
    setOnboardingCompleted: () => Promise<void>;
    setDbReady: (ready: boolean) => void;
    setDemoMode: (enabled: boolean) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
    settings: defaultSettings,
    isLoading: true,
    isDbReady: false,

    loadSettings: async () => {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<AppSettings>;
                set({ settings: { ...defaultSettings, ...parsed }, isLoading: false });
            } else {
                await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            set({ isLoading: false });
        }
    },

    updateSettings: async (updates) => {
        const current = get().settings;
        const newSettings = { ...current, ...updates };
        set({ settings: newSettings });
        try {
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    },

    setCurrency: async (currency) => {
        await get().updateSettings({ currency });
    },

    setTheme: async (theme) => {
        await get().updateSettings({ theme });
    },

    setOnboardingCompleted: async () => {
        await get().updateSettings({ onboardingCompleted: true });
    },

    setDbReady: (ready) => set({ isDbReady: ready }),

    setDemoMode: async (enabled) => {
        await get().updateSettings({ demoMode: enabled });
    },
}));
