import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, useTransactionStore } from '../../src/stores';
import { colors, palette } from '../../src/theme/colors';
import { spacing, radius, shadows } from '../../src/theme/spacing';
import { fontFamily, fontSize } from '../../src/theme/typography';
import { formatCurrency } from '../../src/utils';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { settings } = useAppStore();
    const { monthSummary, loadAll } = useTransactionStore();

    useEffect(() => {
        loadAll();
    }, []);

    const menuItems = [
        { icon: '🎯', label: 'Financial Goals', route: '/goals' },
        { icon: '⚙️', label: 'Settings', route: '/settings' },
        { icon: '💱', label: 'Currency', value: settings.currency },
        { icon: '📤', label: 'Export Data', comingSoon: true },
        { icon: '☁️', label: 'Cloud Sync', comingSoon: true },
        { icon: '❓', label: 'Help & Support', comingSoon: true },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text style={styles.headerTitle}>Profile</Text>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        style={styles.avatarGradient}
                    >
                        <Text style={styles.avatarText}>AJ</Text>
                    </LinearGradient>
                </View>
                <Text style={styles.profileName}>Alex Johnson</Text>
                <Text style={styles.profileEmail}>alex@example.com</Text>
                {settings.demoMode && (
                    <View style={styles.demoBadge}>
                        <Text style={styles.demoBadgeText}>Demo Mode</Text>
                    </View>
                )}
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <View style={[styles.statIconBg, { backgroundColor: palette.green50 }]}>
                        <Text style={styles.statIcon}>📈</Text>
                    </View>
                    <Text style={styles.statLabel}>Income</Text>
                    <Text style={[styles.statValue, { color: colors.income }]}>
                        {formatCurrency(monthSummary.totalIncome, settings.currency)}
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <View style={[styles.statIconBg, { backgroundColor: palette.red50 }]}>
                        <Text style={styles.statIcon}>📉</Text>
                    </View>
                    <Text style={styles.statLabel}>Expenses</Text>
                    <Text style={[styles.statValue, { color: colors.expense }]}>
                        {formatCurrency(monthSummary.totalExpense, settings.currency)}
                    </Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuCard}>
                {menuItems.map((item, index) => (
                    <React.Fragment key={item.label}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                if (item.comingSoon) {
                                    return;
                                }
                                if (item.route) {
                                    router.push(item.route as any);
                                }
                            }}
                            activeOpacity={item.comingSoon ? 1 : 0.7}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconBg}>
                                    <Text style={styles.menuIcon}>{item.icon}</Text>
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <View style={styles.menuItemRight}>
                                {item.value && (
                                    <Text style={styles.menuValue}>{item.value}</Text>
                                )}
                                {item.comingSoon && (
                                    <View style={styles.comingSoonBadge}>
                                        <Text style={styles.comingSoonText}>Soon</Text>
                                    </View>
                                )}
                                {!item.comingSoon && !item.value && (
                                    <Text style={styles.menuArrow}>›</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                        {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
                    </React.Fragment>
                ))}
            </View>

            <View style={{ height: 120 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingHorizontal: spacing.xl,
    },
    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.h2,
        color: colors.textPrimary,
        marginBottom: spacing.xl,
    },

    // Profile Card
    profileCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        padding: spacing.xxl,
        alignItems: 'center',
        marginBottom: spacing.xl,
        ...shadows.sm,
    },
    avatarContainer: {
        marginBottom: spacing.lg,
    },
    avatarGradient: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: fontFamily.bold,
        fontSize: 26,
        color: colors.textInverse,
    },
    profileName: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
        marginBottom: spacing.xxs,
    },
    profileEmail: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    demoBadge: {
        backgroundColor: palette.green50,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xxs,
        borderRadius: radius.pill,
        marginTop: spacing.md,
    },
    demoBadgeText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: palette.green600,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    statIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    statIcon: {
        fontSize: 22,
    },
    statLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
        marginBottom: spacing.xxs,
    },
    statValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
    },

    // Menu
    menuCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        overflow: 'hidden',
        ...shadows.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    menuIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: palette.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIcon: {
        fontSize: 20,
    },
    menuLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuValue: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textTertiary,
    },
    menuArrow: {
        fontSize: 24,
        color: colors.textTertiary,
    },
    comingSoonBadge: {
        backgroundColor: palette.gray100,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.pill,
    },
    comingSoonText: {
        fontFamily: fontFamily.medium,
        fontSize: 10,
        color: colors.textTertiary,
    },
    menuDivider: {
        height: 1,
        backgroundColor: palette.gray100,
        marginHorizontal: spacing.lg,
    },
});
