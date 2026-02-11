import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
    useFonts,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { runMigrations, seedDefaults } from '../src/database';
import { seedDemoData } from '../src/database/demoData';
import { useAppStore } from '../src/stores';
import { colors } from '../src/theme/colors';
import ErrorBoundary from '../src/components/ErrorBoundary';

export default function RootLayout() {
    const [dbReady, setDbReady] = useState(false);
    const loadSettings = useAppStore((s) => s.loadSettings);

    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
    });

    useEffect(() => {
        async function init() {
            try {
                await runMigrations();
                await seedDefaults();
                await seedDemoData();
                await loadSettings();
                setDbReady(true);
            } catch (error) {
                console.error('Initialization error:', error);
                setDbReady(true); // Still show app (error state)
            }
        }
        init();
    }, []);

    if (!fontsLoaded || !dbReady) {
        return (
            <View style={styles.splash}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ErrorBoundary>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="add-transaction"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                    name="edit-transaction"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="goals" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="transactions" />
            </Stack>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primaryBg,
    },
});
