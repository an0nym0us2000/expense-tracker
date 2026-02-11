import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useBudgetStore, useAppStore, useTransactionStore } from '../../src/stores';
import { categoryRepo } from '../../src/database';
import { colors, palette } from '../../src/theme/colors';
import { spacing, radius, shadows } from '../../src/theme/spacing';
import { fontFamily, fontSize } from '../../src/theme/typography';
import { formatCurrency, formatMonthYear } from '../../src/utils';
import type { Category } from '../../src/types';
import { BottomSheet, ConfirmDialog } from '../../src/components/ui';

export default function BudgetsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const currency = useAppStore((s) => s.settings.currency);
    const {
        budgets,
        isLoading,
        loadBudgets,
        addBudget,
        updateBudget,
        deleteBudget,
    } = useBudgetStore();
    const { selectedMonth, selectedYear, monthSummary } = useTransactionStore();

    const [categories, setCategories] = useState<Category[]>([]);
    const [showAddSheet, setShowAddSheet] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedBudgetId, setSelectedBudgetId] = useState('');
    const [newCategoryId, setNewCategoryId] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [editAmount, setEditAmount] = useState('');

    useEffect(() => {
        loadBudgets(selectedMonth, selectedYear);
        categoryRepo.getByType('expense').then(setCategories);
    }, [selectedMonth, selectedYear]);

    const { totalBudget, totalSpent, overallPercent } = useMemo(() => {
        const budget = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
        const spent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
        const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
        return { totalBudget: budget, totalSpent: spent, overallPercent: percent };
    }, [budgets]);

    const handleAddBudget = useCallback(async () => {
        if (!newCategoryId || !newAmount || parseFloat(newAmount) <= 0) {
            Alert.alert('Missing Info', 'Select a category and enter a budget amount.');
            return;
        }
        const month = selectedMonth;
        const year = selectedYear;
        await addBudget({
            categoryId: newCategoryId,
            limitAmount: parseFloat(newAmount),
            month,
            year,
        });
        setShowAddSheet(false);
        setNewCategoryId('');
        setNewAmount('');
    }, [newCategoryId, newAmount, selectedMonth, selectedYear, addBudget]);

    const handleDeleteBudget = useCallback(async () => {
        await deleteBudget(selectedBudgetId);
        setShowDeleteDialog(false);
    }, [selectedBudgetId, deleteBudget]);

    const handleEditBudget = (budgetId: string, currentAmount: number) => {
        setSelectedBudgetId(budgetId);
        setEditAmount(currentAmount.toString());
        setShowEditSheet(true);
    };

    const handleUpdateBudget = useCallback(async () => {
        if (!editAmount || parseFloat(editAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
            return;
        }
        await updateBudget(selectedBudgetId, {
            limitAmount: parseFloat(editAmount),
        });
        setShowEditSheet(false);
        setEditAmount('');
        Alert.alert('Success', 'Budget updated successfully');
    }, [selectedBudgetId, editAmount, updateBudget]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Budgets</Text>
                <Text style={styles.headerMonth}>
                    {formatMonthYear(selectedMonth, selectedYear)}
                </Text>
            </View>

            {/* Overall Budget Card */}
            <View style={styles.overallCard}>
                <View style={styles.overallHeader}>
                    <Text style={styles.overallLabel}>Monthly Budget</Text>
                    <Text style={styles.overallPercent}>{overallPercent.toFixed(0)}%</Text>
                </View>
                <Text style={styles.overallAmount}>
                    {formatCurrency(totalSpent, currency)}{' '}
                    <Text style={styles.overallTotal}>
                        / {formatCurrency(totalBudget, currency)}
                    </Text>
                </Text>
                {/* Progress bar */}
                <View style={styles.overallBar}>
                    <LinearGradient
                        colors={
                            overallPercent > 80
                                ? [palette.red400, palette.red500]
                                : overallPercent > 60
                                    ? [palette.orange400, palette.orange500]
                                    : [colors.primaryGradientStart, colors.primaryGradientEnd]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.overallBarFill, { width: `${overallPercent}%` }]}
                    />
                </View>
            </View>

            {/* Budget Items */}
            {budgets.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>💰</Text>
                    <Text style={styles.emptyTitle}>No budgets set</Text>
                    <Text style={styles.emptySubtitle}>
                        Create budgets to track your spending by category
                    </Text>
                </View>
            ) : (
                budgets.map((budget) => {
                    const spent = budget.spent || 0;
                    const percent = Math.min((spent / budget.limitAmount) * 100, 100);
                    const isOver = spent > budget.limitAmount;
                    return (
                        <View key={budget.id} style={styles.budgetCard}>
                            <View style={styles.budgetHeader}>
                                <View style={styles.budgetLeft}>
                                    <View
                                        style={[
                                            styles.budgetIcon,
                                            { backgroundColor: `${budget.categoryColor}15` },
                                        ]}
                                    >
                                        <Text style={{ fontSize: 22 }}>{budget.categoryIcon}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.budgetName}>{budget.categoryName}</Text>
                                        <Text style={styles.budgetSmall}>
                                            {formatCurrency(spent, currency)} / {formatCurrency(budget.limitAmount, currency)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.budgetRight}>
                                    <Text
                                        style={[
                                            styles.budgetPercent,
                                            { color: isOver ? colors.error : colors.textPrimary },
                                        ]}
                                    >
                                        {percent.toFixed(0)}%
                                    </Text>
                                    <View style={styles.budgetActions}>
                                        <TouchableOpacity
                                            style={styles.budgetActionBtn}
                                            onPress={() => handleEditBudget(budget.id, budget.limitAmount)}
                                        >
                                            <Text style={styles.budgetActionIcon}>✏️</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.budgetActionBtn}
                                            onPress={() => {
                                                setSelectedBudgetId(budget.id);
                                                setShowDeleteDialog(true);
                                            }}
                                        >
                                            <Text style={styles.budgetActionIcon}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.budgetBar}>
                                <View
                                    style={[
                                        styles.budgetBarFill,
                                        {
                                            width: `${percent}%`,
                                            backgroundColor: isOver
                                                ? colors.error
                                                : percent > 80
                                                    ? colors.warning
                                                    : colors.primary,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    );
                })
            )}

            {/* Add Budget Button */}
            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddSheet(true)}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addBtnGradient}
                >
                    <Text style={styles.addBtnText}>+ Add Budget</Text>
                </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 120 }} />

            {/* Add Budget Sheet */}
            <BottomSheet
                visible={showAddSheet}
                onClose={() => setShowAddSheet(false)}
                title="New Budget"
                snapPoint={0.65}
            >
                <Text style={styles.sheetLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.catChip,
                                newCategoryId === cat.id && styles.catChipActive,
                            ]}
                            onPress={() => setNewCategoryId(cat.id)}
                        >
                            <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                            <Text
                                style={[
                                    styles.catChipLabel,
                                    newCategoryId === cat.id && styles.catChipLabelActive,
                                ]}
                            >
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sheetLabel}>Budget Amount</Text>
                <TextInput
                    style={styles.sheetInput}
                    value={newAmount}
                    onChangeText={setNewAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={palette.gray400}
                />

                <TouchableOpacity style={styles.sheetSubmit} onPress={handleAddBudget}>
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sheetSubmitGradient}
                    >
                        <Text style={styles.sheetSubmitText}>Create Budget</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </BottomSheet>

            {/* Edit Budget Sheet */}
            <BottomSheet
                visible={showEditSheet}
                onClose={() => setShowEditSheet(false)}
                title="Edit Budget"
                snapPoint={0.45}
            >
                <Text style={styles.sheetLabel}>Budget Amount</Text>
                <TextInput
                    style={styles.sheetInput}
                    value={editAmount}
                    onChangeText={setEditAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={palette.gray400}
                />

                <TouchableOpacity style={styles.sheetSubmit} onPress={handleUpdateBudget}>
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sheetSubmitGradient}
                    >
                        <Text style={styles.sheetSubmitText}>Update Budget</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </BottomSheet>

            <ConfirmDialog
                visible={showDeleteDialog}
                title="Delete Budget"
                message="Are you sure you want to remove this budget?"
                confirmLabel="Delete"
                onConfirm={handleDeleteBudget}
                onCancel={() => setShowDeleteDialog(false)}
                destructive
            />
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
        marginBottom: spacing.xl,
    },
    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.h2,
        color: colors.textPrimary,
    },
    headerMonth: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },

    // Overall Card
    overallCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        ...shadows.sm,
    },
    overallHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    overallLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    overallPercent: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    overallAmount: {
        fontFamily: fontFamily.bold,
        fontSize: 28,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    overallTotal: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.lg,
        color: colors.textTertiary,
    },
    overallBar: {
        height: 10,
        borderRadius: 5,
        backgroundColor: palette.gray200,
        overflow: 'hidden',
    },
    overallBarFill: {
        height: 10,
        borderRadius: 5,
    },

    // Budget Items
    budgetCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    budgetLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    budgetRight: {
        alignItems: 'flex-end',
        gap: spacing.sm,
    },
    budgetActions: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    budgetActionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: palette.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    budgetActionIcon: {
        fontSize: 16,
    },
    budgetIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    budgetName: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    budgetSmall: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
        marginTop: 2,
    },
    budgetPercent: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
    },
    budgetBar: {
        height: 6,
        borderRadius: 3,
        backgroundColor: palette.gray200,
        overflow: 'hidden',
    },
    budgetBarFill: {
        height: 6,
        borderRadius: 3,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
    },
    emptyIcon: { fontSize: 48, marginBottom: spacing.lg },
    emptyTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },

    // Add Button
    addBtn: {
        marginTop: spacing.md,
        borderRadius: radius.lg,
        overflow: 'hidden',
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    addBtnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: radius.lg,
    },
    addBtnText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textInverse,
    },

    // Sheet styles
    sheetLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    catChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: palette.gray200,
        marginRight: spacing.sm,
        gap: spacing.xs,
        backgroundColor: colors.backgroundSecondary,
    },
    catChipActive: {
        backgroundColor: palette.green50,
        borderColor: palette.green400,
    },
    catChipLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    catChipLabelActive: {
        color: palette.green700,
    },
    sheetInput: {
        backgroundColor: palette.gray100,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    sheetSubmit: {
        marginTop: spacing.xl,
        borderRadius: radius.lg,
        overflow: 'hidden',
    },
    sheetSubmitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: radius.lg,
    },
    sheetSubmitText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textInverse,
    },
});
