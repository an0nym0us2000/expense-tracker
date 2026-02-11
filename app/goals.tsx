import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGoalStore, useAppStore } from '../src/stores';
import { colors, palette } from '../src/theme/colors';
import { spacing, radius, shadows } from '../src/theme/spacing';
import { fontFamily, fontSize } from '../src/theme/typography';
import { formatCurrency } from '../src/utils';
import { BottomSheet, ConfirmDialog } from '../src/components/ui';
import GoalCelebration from '../src/components/GoalCelebration';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GOAL_EMOJIS = ['✈️', '🚗', '🏠', '💻', '📱', '🎓', '💍', '🏖️', '🎯', '💰'];

export default function GoalsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const currency = useAppStore((s) => s.settings.currency);
    const { goals, isLoading, loadGoals, addGoal, addFunds, deleteGoal } = useGoalStore();

    const [showAddSheet, setShowAddSheet] = useState(false);
    const [showFundSheet, setShowFundSheet] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState('');
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [newGoalEmoji, setNewGoalEmoji] = useState('🎯');
    const [fundAmount, setFundAmount] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebratingGoal, setCelebratingGoal] = useState<{ title: string; amount: number } | null>(null);

    useEffect(() => {
        loadGoals();
    }, []);

    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    const handleAddGoal = async () => {
        if (!newGoalTitle.trim() || !newGoalTarget || parseFloat(newGoalTarget) <= 0) {
            Alert.alert('Missing Info', 'Please fill in goal name and target amount.');
            return;
        }
        await addGoal({
            title: newGoalTitle.trim(),
            targetAmount: parseFloat(newGoalTarget),
            ...(newGoalDeadline && { deadline: newGoalDeadline }),
            icon: newGoalEmoji,
        });
        setShowAddSheet(false);
        setNewGoalTitle('');
        setNewGoalTarget('');
        setNewGoalDeadline('');
        setNewGoalEmoji('🎯');
    };

    const handleAddFunds = async () => {
        if (!fundAmount || parseFloat(fundAmount) <= 0) return;

        const goal = goals.find((g) => g.id === selectedGoalId);
        if (!goal) return;

        const newAmount = goal.currentAmount + parseFloat(fundAmount);
        await addFunds(selectedGoalId, parseFloat(fundAmount));

        // Check if goal is completed
        if (newAmount >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
            setCelebratingGoal({ title: goal.title, amount: goal.targetAmount });
            setShowCelebration(true);
        }

        setShowFundSheet(false);
        setFundAmount('');
    };

    const handleDeleteGoal = async () => {
        await deleteGoal(selectedGoalId);
        setShowDeleteDialog(false);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Financial Goals</Text>
                    <Text style={styles.subtitle}>Keep your dreams on track</Text>
                </View>
                <TouchableOpacity style={styles.avatarBtn}>
                    <Text style={styles.avatarEmoji}>👤</Text>
                </TouchableOpacity>
            </View>

            {/* Total Saved Banner */}
            <LinearGradient
                colors={['#EAFFF0', '#D0F5DC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.totalBanner}
            >
                <Text style={styles.totalLabel}>TOTAL SAVED</Text>
                <View style={styles.totalRow}>
                    <Text style={styles.totalAmount}>
                        {formatCurrency(totalSaved, currency)}
                    </Text>
                    <View style={styles.totalIcon}>
                        <Text style={{ fontSize: 20 }}>💰</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Goals Grid */}
            {goals.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🎯</Text>
                    <Text style={styles.emptyTitle}>No goals yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Create your first savings goal to start tracking your progress
                    </Text>
                </View>
            ) : (
                <>
                    {/* Goal Cards in Grid (first 2) */}
                    <View style={styles.goalGrid}>
                        {goals.slice(0, 2).map((goal) => {
                            const percent = Math.min(
                                (goal.currentAmount / goal.targetAmount) * 100,
                                100
                            );
                            return (
                                <TouchableOpacity
                                    key={goal.id}
                                    style={styles.goalGridCard}
                                    onPress={() => {
                                        setSelectedGoalId(goal.id);
                                        setShowFundSheet(true);
                                    }}
                                    onLongPress={() => {
                                        setSelectedGoalId(goal.id);
                                        setShowDeleteDialog(true);
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.goalGridEmoji}>{goal.icon || '🎯'}</Text>
                                    <Text style={styles.goalGridTitle}>{goal.title}</Text>
                                    {goal.deadline && (
                                        <Text style={styles.goalGridDeadline}>
                                            Due {goal.deadline}
                                        </Text>
                                    )}

                                    {/* Circular Progress */}
                                    <View style={styles.circularProgress}>
                                        <View
                                            style={[
                                                styles.circularOuter,
                                                {
                                                    borderTopColor: palette.green400,
                                                    borderRightColor:
                                                        percent > 25 ? palette.green400 : palette.gray200,
                                                    borderBottomColor:
                                                        percent > 50 ? palette.green400 : palette.gray200,
                                                    borderLeftColor:
                                                        percent > 75 ? palette.green400 : palette.gray200,
                                                },
                                            ]}
                                        />
                                        <Text style={styles.circularText}>
                                            {percent.toFixed(0)}%
                                        </Text>
                                    </View>

                                    <View style={styles.goalGridAmounts}>
                                        <Text style={styles.goalGridSaved}>
                                            {formatCurrency(goal.currentAmount, currency)}
                                        </Text>
                                        <Text style={styles.goalGridTarget}>
                                            {formatCurrency(goal.targetAmount, currency)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Remaining goals as list items */}
                    {goals.slice(2).map((goal) => {
                        const percent = Math.min(
                            (goal.currentAmount / goal.targetAmount) * 100,
                            100
                        );
                        return (
                            <TouchableOpacity
                                key={goal.id}
                                style={styles.goalListCard}
                                onPress={() => {
                                    setSelectedGoalId(goal.id);
                                    setShowFundSheet(true);
                                }}
                                onLongPress={() => {
                                    setSelectedGoalId(goal.id);
                                    setShowDeleteDialog(true);
                                }}
                                activeOpacity={0.85}
                            >
                                <View style={styles.goalListHeader}>
                                    <View style={styles.goalListLeft}>
                                        <Text style={styles.goalListEmoji}>{goal.icon || '🎯'}</Text>
                                        <Text style={styles.goalListTitle}>{goal.title}</Text>
                                    </View>
                                    <View style={styles.goalListPercentBadge}>
                                        <Text style={styles.goalListPercentText}>
                                            {percent.toFixed(0)}%
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.goalListTarget}>
                                    Target: {formatCurrency(goal.targetAmount, currency)}
                                </Text>
                                {/* Progress bar */}
                                <View style={styles.goalListBar}>
                                    <LinearGradient
                                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.goalListBarFill, { width: `${percent}%` }]}
                                    />
                                </View>
                                <Text style={styles.goalListSaved}>
                                    {formatCurrency(goal.currentAmount, currency)} saved
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </>
            )}

            {/* Add Goal Button */}
            <TouchableOpacity
                style={styles.addGoalBtn}
                onPress={() => setShowAddSheet(true)}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addGoalGradient}
                >
                    <Text style={styles.addGoalText}>+ Add New Goal</Text>
                </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 120 }} />

            {/* Add Goal Sheet */}
            <BottomSheet
                visible={showAddSheet}
                onClose={() => setShowAddSheet(false)}
                title="New Goal"
                snapPoint={0.75}
            >
                {/* Emoji Picker */}
                <Text style={styles.sheetLabel}>Choose an Icon</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
                    {GOAL_EMOJIS.map((emoji) => (
                        <TouchableOpacity
                            key={emoji}
                            style={[
                                styles.emojiBtn,
                                newGoalEmoji === emoji && styles.emojiBtnActive,
                            ]}
                            onPress={() => setNewGoalEmoji(emoji)}
                        >
                            <Text style={styles.emojiBtnText}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sheetLabel}>Goal Name</Text>
                <TextInput
                    style={styles.sheetInput}
                    value={newGoalTitle}
                    onChangeText={setNewGoalTitle}
                    placeholder="e.g., Bali Trip"
                    placeholderTextColor={colors.textTertiary}
                />

                <Text style={styles.sheetLabel}>Target Amount</Text>
                <TextInput
                    style={styles.sheetInput}
                    value={newGoalTarget}
                    onChangeText={setNewGoalTarget}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textTertiary}
                />

                <Text style={styles.sheetLabel}>Deadline (optional)</Text>
                <TextInput
                    style={styles.sheetInput}
                    value={newGoalDeadline}
                    onChangeText={setNewGoalDeadline}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textTertiary}
                />

                <TouchableOpacity style={styles.sheetSubmit} onPress={handleAddGoal}>
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sheetSubmitGradient}
                    >
                        <Text style={styles.sheetSubmitText}>Create Goal</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </BottomSheet>

            {/* Add Funds Sheet */}
            <BottomSheet
                visible={showFundSheet}
                onClose={() => setShowFundSheet(false)}
                title="Add Funds"
                snapPoint={0.4}
            >
                <Text style={styles.sheetLabel}>Amount</Text>
                <TextInput
                    style={styles.sheetInput}
                    value={fundAmount}
                    onChangeText={setFundAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textTertiary}
                />
                <TouchableOpacity style={styles.sheetSubmit} onPress={handleAddFunds}>
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sheetSubmitGradient}
                    >
                        <Text style={styles.sheetSubmitText}>Add Funds</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </BottomSheet>

            {/* Delete Confirmation */}
            <ConfirmDialog
                visible={showDeleteDialog}
                title="Delete Goal"
                message="Are you sure you want to delete this goal? This cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDeleteGoal}
                onCancel={() => setShowDeleteDialog(false)}
                destructive
            />

            {/* Goal Celebration */}
            <GoalCelebration
                visible={showCelebration}
                goalTitle={celebratingGoal?.title || ''}
                goalAmount={celebratingGoal?.amount || 0}
                onClose={() => setShowCelebration(false)}
                onSetNewGoal={() => setShowAddSheet(true)}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    title: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.h2,
        color: colors.textPrimary,
    },
    subtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    avatarBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: palette.green100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: { fontSize: 22 },

    // Total Saved Banner
    totalBanner: {
        borderRadius: radius.xl,
        padding: spacing.xl,
        marginBottom: spacing.xl,
    },
    totalLabel: {
        fontFamily: fontFamily.bold,
        fontSize: 11,
        color: palette.green600,
        letterSpacing: 1.5,
        marginBottom: spacing.xs,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalAmount: {
        fontFamily: fontFamily.bold,
        fontSize: 32,
        color: colors.textPrimary,
        letterSpacing: -1,
    },
    totalIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: palette.green400,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Goal Grid
    goalGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    goalGridCard: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    goalGridEmoji: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    goalGridTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    goalGridDeadline: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
        marginBottom: spacing.md,
    },
    circularProgress: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    circularOuter: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        transform: [{ rotate: '-45deg' }],
    },
    circularText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
    goalGridAmounts: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    goalGridSaved: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xs,
        color: colors.textPrimary,
    },
    goalGridTarget: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },

    // Goal List Card
    goalListCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        padding: spacing.xl,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    goalListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    goalListLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    goalListEmoji: {
        fontSize: 22,
    },
    goalListTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
    goalListPercentBadge: {
        backgroundColor: palette.green50,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xxs,
        borderRadius: radius.pill,
    },
    goalListPercentText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.sm,
        color: palette.green600,
    },
    goalListTarget: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    goalListBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: palette.gray200,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    goalListBarFill: {
        height: 8,
        borderRadius: 4,
    },
    goalListSaved: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
    },
    emptyIcon: { fontSize: 52, marginBottom: spacing.lg },
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
        paddingHorizontal: spacing.xl,
    },

    // Add Goal Button
    addGoalBtn: {
        marginTop: spacing.lg,
        borderRadius: radius.lg,
        overflow: 'hidden',
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    addGoalGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: radius.lg,
    },
    addGoalText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textInverse,
    },

    // Bottom Sheet Styles
    sheetLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    sheetInput: {
        backgroundColor: palette.gray100,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    emojiRow: {
        marginBottom: spacing.md,
    },
    emojiBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        backgroundColor: palette.gray100,
    },
    emojiBtnActive: {
        backgroundColor: palette.green50,
        borderWidth: 2,
        borderColor: palette.green400,
    },
    emojiBtnText: {
        fontSize: 24,
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
