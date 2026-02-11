import React, { useEffect, useState } from 'react';
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
import { useTransactionStore, useAppStore } from '../../src/stores';
import { colors, palette } from '../../src/theme/colors';
import { spacing, radius, shadows } from '../../src/theme/spacing';
import { fontFamily, fontSize } from '../../src/theme/typography';
import { formatCurrency, formatMonthYear } from '../../src/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnalyticsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const currency = useAppStore((s) => s.settings.currency);
    const {
        transactions,
        monthSummary,
        categoryBreakdown,
        dailySpending,
        selectedMonth,
        selectedYear,
        isLoading,
        loadAll,
        loadCategoryBreakdown,
        prevMonth,
        nextMonth,
    } = useTransactionStore();

    const [activeTab, setActiveTab] = useState<'week' | 'month'>('month');
    const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');

    useEffect(() => {
        loadAll();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        loadCategoryBreakdown(activeType);
    }, [activeType, selectedMonth, selectedYear]);

    const totalSpent = monthSummary.totalExpense;
    const maxDaily = Math.max(...dailySpending.map((d) => d.amount), 1);

    // Find top spending category
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Analytics</Text>
                <TouchableOpacity style={styles.filterBtn}>
                    <Text style={styles.filterIcon}>☰</Text>
                </TouchableOpacity>
            </View>

            {/* Period Toggle */}
            <View style={styles.periodToggle}>
                <TouchableOpacity
                    style={[styles.periodTab, activeTab === 'week' && styles.periodTabActive]}
                    onPress={() => setActiveTab('week')}
                >
                    <Text style={[styles.periodTabText, activeTab === 'week' && styles.periodTabTextActive]}>
                        Week
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.periodTab, activeTab === 'month' && styles.periodTabActive]}
                    onPress={() => setActiveTab('month')}
                >
                    <Text style={[styles.periodTabText, activeTab === 'month' && styles.periodTabTextActive]}>
                        Month
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Total Spent */}
            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Spent</Text>
                <Text style={styles.totalAmount}>
                    {formatCurrency(totalSpent, currency)}
                </Text>
                <View style={styles.comparisonBadge}>
                    <Text style={styles.comparisonText}>↓ 12% vs last month</Text>
                </View>
            </View>

            {/* Spending Trend */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Spending Trend</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>Full History</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.trendCard}>
                {dailySpending.length > 0 ? (
                    <View style={styles.chartArea}>
                        {/* Simple line chart visualization */}
                        <View style={styles.chartGrid}>
                            {dailySpending.map((day, i) => {
                                const barHeight = (day.amount / maxDaily) * 100;
                                return (
                                    <View key={i} style={styles.chartPoint}>
                                        <View
                                            style={[
                                                styles.chartBar,
                                                {
                                                    height: Math.max(barHeight, 3),
                                                    backgroundColor: palette.green400,
                                                    opacity: 0.3 + (barHeight / 100) * 0.7,
                                                },
                                            ]}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                        {/* X-axis labels */}
                        <View style={styles.chartLabels}>
                            {dailySpending
                                .filter((_, i) => i % Math.ceil(dailySpending.length / 6) === 0)
                                .map((day, i) => (
                                    <Text key={i} style={styles.chartLabel}>
                                        {parseInt(day.date.split('-')[2])}
                                    </Text>
                                ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyChart}>
                        <Text style={styles.emptyChartText}>No spending data</Text>
                    </View>
                )}
            </View>

            {/* Category Breakdown */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Category Breakdown</Text>
            </View>

            {/* Donut Chart */}
            {topCategory && (
                <View style={styles.donutSection}>
                    <View style={styles.donutChart}>
                        <View style={styles.donutOuter}>
                            {/* Colored segments represented as border */}
                            <View
                                style={[
                                    styles.donutRing,
                                    {
                                        borderTopColor: categoryBreakdown[0]?.categoryColor || palette.green400,
                                        borderRightColor: categoryBreakdown[1]?.categoryColor || palette.gray200,
                                        borderBottomColor: categoryBreakdown[2]?.categoryColor || palette.gray200,
                                        borderLeftColor: categoryBreakdown[3]?.categoryColor || palette.gray200,
                                    },
                                ]}
                            />
                            <View style={styles.donutCenter}>
                                <Text style={styles.donutCenterLabel}>Top Spending</Text>
                                <Text style={styles.donutCenterValue}>
                                    {topCategory.categoryName}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Category List */}
            <View style={styles.categoryList}>
                {categoryBreakdown.map((cat) => (
                    <View key={cat.categoryId} style={styles.categoryItem}>
                        <View
                            style={[
                                styles.categoryIcon,
                                { backgroundColor: `${cat.categoryColor}15` },
                            ]}
                        >
                            <Text style={styles.categoryEmoji}>{cat.categoryIcon}</Text>
                        </View>
                        <View style={styles.categoryInfo}>
                            <View style={styles.categoryRow}>
                                <Text style={styles.categoryName}>{cat.categoryName}</Text>
                                <Text style={styles.categoryAmount}>
                                    {formatCurrency(cat.amount, currency)}
                                </Text>
                            </View>
                            <View style={styles.categoryRow}>
                                <Text style={styles.categoryPercent}>
                                    ● {cat.percentage.toFixed(0)}%
                                </Text>
                                <Text style={styles.categorySubtext}>
                                    {cat.transactionCount} transactions
                                </Text>
                            </View>
                            {/* Progress bar */}
                            <View style={styles.categoryBar}>
                                <View
                                    style={[
                                        styles.categoryBarFill,
                                        {
                                            width: `${cat.percentage}%`,
                                            backgroundColor: cat.categoryColor,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    </View>
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

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 28,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    title: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
    },
    filterBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterIcon: {
        fontSize: 20,
        color: colors.textSecondary,
    },

    // Period Toggle
    periodToggle: {
        flexDirection: 'row',
        backgroundColor: palette.gray100,
        borderRadius: radius.pill,
        padding: 4,
        marginBottom: spacing.xxl,
    },
    periodTab: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: radius.pill,
        alignItems: 'center',
    },
    periodTabActive: {
        backgroundColor: palette.green400,
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    periodTabText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    periodTabTextActive: {
        color: colors.textInverse,
    },

    // Total Spent
    totalSection: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    totalLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    totalAmount: {
        fontFamily: fontFamily.bold,
        fontSize: 40,
        color: colors.textPrimary,
        letterSpacing: -1.5,
        marginBottom: spacing.sm,
    },
    comparisonBadge: {
        backgroundColor: palette.green50,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
    },
    comparisonText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: palette.green600,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
    seeAllText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textGreen,
    },

    // Trend Chart
    trendCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.xxl,
        ...shadows.sm,
    },
    chartArea: {
        height: 130,
    },
    chartGrid: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
    },
    chartPoint: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    chartBar: {
        borderRadius: 2,
        minHeight: 3,
    },
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    chartLabel: {
        fontFamily: fontFamily.regular,
        fontSize: 10,
        color: colors.textTertiary,
    },
    emptyChart: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyChartText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textTertiary,
    },

    // Donut
    donutSection: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    donutChart: {
        alignItems: 'center',
    },
    donutOuter: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    donutRing: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 18,
        transform: [{ rotate: '-45deg' }],
    },
    donutCenter: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    donutCenterLabel: {
        fontFamily: fontFamily.regular,
        fontSize: 11,
        color: colors.textTertiary,
    },
    donutCenterValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
        marginTop: 2,
    },

    // Category List
    categoryList: {
        gap: spacing.md,
    },
    categoryItem: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
        ...shadows.sm,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryEmoji: {
        fontSize: 22,
    },
    categoryInfo: {
        flex: 1,
        gap: spacing.xs,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryName: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    categoryAmount: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    categoryPercent: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },
    categorySubtext: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },
    categoryBar: {
        height: 4,
        borderRadius: 2,
        backgroundColor: palette.gray200,
        marginTop: spacing.xs,
    },
    categoryBarFill: {
        height: 4,
        borderRadius: 2,
    },
});
