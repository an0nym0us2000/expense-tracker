import React, { useEffect, useMemo, useCallback } from 'react';
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
import { useTransactionStore, useAppStore } from '../../src/stores';
import { colors, palette } from '../../src/theme/colors';
import { spacing, radius, shadows } from '../../src/theme/spacing';
import { fontFamily, fontSize } from '../../src/theme/typography';
import { formatCurrency, formatMonthYear, formatShortDate } from '../../src/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const currency = useAppStore((s) => s.settings.currency);
    const {
        transactions,
        monthSummary,
        selectedMonth,
        selectedYear,
        isLoading,
        loadAll,
        prevMonth,
        nextMonth,
    } = useTransactionStore();

    useEffect(() => {
        loadAll();
    }, [selectedMonth, selectedYear]);

    const netBalance = useMemo(
        () => monthSummary.totalIncome - monthSummary.totalExpense,
        [monthSummary.totalIncome, monthSummary.totalExpense]
    );

    const recentTxns = useMemo(() => transactions.slice(0, 5), [transactions]);

    // Donut chart data
    const { totalFlow, incomePercent } = useMemo(() => {
        const flow = monthSummary.totalIncome + monthSummary.totalExpense;
        const percent = flow > 0 ? (monthSummary.totalIncome / flow) * 100 : 50;
        return { totalFlow: flow, incomePercent: percent };
    }, [monthSummary.totalIncome, monthSummary.totalExpense]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>👤</Text>
                    </View>
                    <View>
                        <Text style={styles.greeting}>Good morning,</Text>
                        <Text style={styles.userName}>Alex Johnson</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => router.push('/settings')}
                >
                    <Text style={styles.settingsIcon}>🔔</Text>
                </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <TouchableOpacity activeOpacity={0.95}>
                <LinearGradient
                    colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.balanceCard}
                >
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>Total Balance</Text>
                        <View style={styles.trendBadge}>
                            <Text style={styles.trendText}>
                                {netBalance >= 0 ? '↑' : '↓'} {((Math.abs(netBalance) / Math.max(monthSummary.totalIncome, 1)) * 100).toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.balanceAmount}>
                        {formatCurrency(Math.abs(netBalance), currency)}
                    </Text>
                    <View style={styles.balanceActions}>
                        <TouchableOpacity
                            style={styles.balanceActionBtn}
                            onPress={() => router.push('/add-transaction')}
                        >
                            <Text style={styles.balanceActionIcon}>+</Text>
                            <Text style={styles.balanceActionText}>Deposit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.balanceActionBtn}
                            onPress={() => router.push('/add-transaction')}
                        >
                            <Text style={styles.balanceActionIcon}>→</Text>
                            <Text style={styles.balanceActionText}>Transfer</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Monthly Overview */}
            <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                    <Text style={styles.overviewTitle}>Monthly Overview</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/analytics')}>
                        <Text style={styles.seeDetailsText}>See Details</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.overviewContent}>
                    {/* Simple Donut Visualization */}
                    <View style={styles.donutContainer}>
                        <View style={styles.donutOuter}>
                            <View
                                style={[
                                    styles.donutFill,
                                    {
                                        borderTopColor: palette.green400,
                                        borderRightColor: incomePercent > 25 ? palette.green400 : palette.gray200,
                                        borderBottomColor: incomePercent > 50 ? palette.green400 : palette.gray200,
                                        borderLeftColor: incomePercent > 75 ? palette.green400 : palette.gray200,
                                    },
                                ]}
                            />
                            <View style={styles.donutInner}>
                                <Text style={styles.donutLabel}>NET</Text>
                                <Text style={styles.donutValue}>
                                    {netBalance >= 0 ? '+' : '-'}
                                    {formatCurrency(Math.abs(netBalance), currency).replace(/[^0-9.,KkMm]/g, '')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: palette.green400 }]} />
                            <Text style={styles.legendLabel}>Income</Text>
                            <Text style={styles.legendValue}>
                                {formatCurrency(monthSummary.totalIncome, currency)}
                            </Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: palette.gray300 }]} />
                            <Text style={styles.legendLabel}>Expense</Text>
                            <Text style={styles.legendValue}>
                                {formatCurrency(monthSummary.totalExpense, currency)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Month Navigator */}
            <View style={styles.monthNav}>
                <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
                    <Text style={styles.monthNavArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthNavText}>
                    {formatMonthYear(selectedMonth, selectedYear)}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
                    <Text style={styles.monthNavArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Transactions */}
            <View style={styles.txSection}>
                <View style={styles.txHeader}>
                    <Text style={styles.txTitle}>Transactions</Text>
                    <TouchableOpacity onPress={() => router.push('/transactions')}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {recentTxns.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyTitle}>No transactions yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Tap the + button to add your first transaction
                        </Text>
                    </View>
                ) : (
                    recentTxns.map((tx) => (
                        <TouchableOpacity
                            key={tx.id}
                            style={styles.txItem}
                            onPress={() => router.push(`/edit-transaction?id=${tx.id}`)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.txIconContainer,
                                    { backgroundColor: `${tx.categoryColor || palette.green400}15` },
                                ]}
                            >
                                <Text style={styles.txIcon}>{tx.categoryIcon || '💰'}</Text>
                            </View>
                            <View style={styles.txDetails}>
                                <Text style={styles.txName}>
                                    {tx.categoryName || 'Transaction'}
                                </Text>
                                <Text style={styles.txDate}>
                                    {formatShortDate(tx.date)}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.txAmount,
                                    { color: tx.type === 'income' ? colors.income : colors.textPrimary },
                                ]}
                            >
                                {tx.type === 'income' ? '+' : '-'}
                                {formatCurrency(tx.amount, currency)}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickActionBtn}
                    onPress={() => router.push('/(tabs)/budgets')}
                >
                    <View style={[styles.quickActionIcon, { backgroundColor: palette.blue50 }]}>
                        <Text style={styles.quickActionEmoji}>💰</Text>
                    </View>
                    <Text style={styles.quickActionLabel}>Budgets</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.quickActionBtn}
                    onPress={() => router.push('/goals')}
                >
                    <View style={[styles.quickActionIcon, { backgroundColor: palette.green50 }]}>
                        <Text style={styles.quickActionEmoji}>🎯</Text>
                    </View>
                    <Text style={styles.quickActionLabel}>Goals</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.quickActionBtn}
                    onPress={() => router.push('/(tabs)/analytics')}
                >
                    <View style={[styles.quickActionIcon, { backgroundColor: palette.purple50 }]}>
                        <Text style={styles.quickActionEmoji}>📊</Text>
                    </View>
                    <Text style={styles.quickActionLabel}>Analytics</Text>
                </TouchableOpacity>
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

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: palette.green100,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: palette.green200,
    },
    avatarText: {
        fontSize: 22,
    },
    greeting: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    userName: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    settingsIcon: {
        fontSize: 20,
    },

    // Balance Card
    balanceCard: {
        borderRadius: radius.xl,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    balanceLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.85)',
    },
    trendBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xxs,
        borderRadius: radius.pill,
    },
    trendText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.textInverse,
    },
    balanceAmount: {
        fontFamily: fontFamily.bold,
        fontSize: 36,
        color: colors.textInverse,
        marginBottom: spacing.lg,
        letterSpacing: -1,
    },
    balanceActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    balanceActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        gap: spacing.xs,
    },
    balanceActionIcon: {
        fontFamily: fontFamily.bold,
        fontSize: 16,
        color: colors.textInverse,
    },
    balanceActionText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textInverse,
    },

    // Monthly Overview
    overviewCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    overviewTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
    seeDetailsText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textGreen,
    },
    overviewContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    donutContainer: {
        marginRight: spacing.xl,
    },
    donutOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    donutFill: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 10,
        transform: [{ rotate: '-45deg' }],
    },
    donutInner: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    donutLabel: {
        fontFamily: fontFamily.medium,
        fontSize: 10,
        color: colors.textTertiary,
        letterSpacing: 0.5,
    },
    donutValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    legendContainer: {
        flex: 1,
        gap: spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        flex: 1,
    },
    legendValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },

    // Month Navigator
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        gap: spacing.xl,
    },
    monthNavBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    monthNavArrow: {
        fontSize: 22,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    monthNavText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },

    // Transactions
    txSection: {
        marginBottom: spacing.xl,
    },
    txHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    txTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
    },
    viewAllText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textGreen,
    },
    txItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        gap: spacing.md,
    },
    txIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    txIcon: {
        fontSize: 22,
    },
    txDetails: {
        flex: 1,
    },
    txName: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    txDate: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
        marginTop: 2,
    },
    txAmount: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.xxl,
    },
    quickActionBtn: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionEmoji: {
        fontSize: 26,
    },
    quickActionLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
});
