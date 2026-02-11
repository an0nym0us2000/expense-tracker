import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, palette } from '../../src/theme/colors';
import { fontFamily, fontSize } from '../../src/theme/typography';
import { spacing, shadows } from '../../src/theme/spacing';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 70 + insets.bottom,
                        paddingBottom: insets.bottom,
                        backgroundColor: colors.tabBarBg,
                        borderTopWidth: 0,
                        elevation: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.06,
                        shadowRadius: 12,
                    },
                    tabBarActiveTintColor: colors.tabBarActive,
                    tabBarInactiveTintColor: colors.tabBarInactive,
                    tabBarLabelStyle: {
                        fontFamily: fontFamily.medium,
                        fontSize: 11,
                        marginTop: 2,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ focused }) => (
                            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🏠</Text>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="budgets"
                    options={{
                        title: 'Expenses',
                        tabBarIcon: ({ focused }) => (
                            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>💳</Text>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="placeholder"
                    options={{
                        title: '',
                        tabBarIcon: () => <View style={{ width: 60 }} />,
                        tabBarLabel: () => null,
                    }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                        },
                    }}
                />
                <Tabs.Screen
                    name="analytics"
                    options={{
                        title: 'Analytics',
                        tabBarIcon: ({ focused }) => (
                            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>📊</Text>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ focused }) => (
                            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>👤</Text>
                        ),
                    }}
                />
            </Tabs>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fabContainer, { bottom: 30 + insets.bottom }]}
                onPress={() => router.push('/add-transaction')}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                    style={styles.fab}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </LinearGradient>
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 100,
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 12,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabIcon: {
        fontSize: 32,
        color: colors.fabIcon,
        fontWeight: '300',
        marginTop: -2,
    },
});
