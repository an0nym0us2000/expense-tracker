import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { colors, palette } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { fontFamily, fontSize } from '../theme/typography';
import { formatCurrency, formatDate } from '../utils';
import type { TransactionWithCategory } from '../types';

interface SwipeableTransactionProps {
    transaction: TransactionWithCategory;
    onDelete: (id: string) => void;
    currency?: string;
}

function SwipeableTransaction({
    transaction,
    onDelete,
    currency = 'USD',
}: SwipeableTransactionProps) {
    const router = useRouter();
    const swipeableRef = useRef<Swipeable>(null);

    const handleEdit = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        swipeableRef.current?.close();
        router.push(`/edit-transaction?id=${transaction.id}`);
    };

    const handleDelete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        swipeableRef.current?.close();
        onDelete(transaction.id);
    };

    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
    ) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.rightActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={handleEdit}
                    activeOpacity={0.7}
                >
                    <Animated.View style={{ transform: [{ scale }] }}>
                        <Text style={styles.actionIcon}>✏️</Text>
                        <Text style={styles.actionText}>Edit</Text>
                    </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                >
                    <Animated.View style={{ transform: [{ scale }] }}>
                        <Text style={styles.actionIcon}>🗑️</Text>
                        <Text style={styles.actionText}>Delete</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    };

    const handleSwipeableOpen = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            onSwipeableOpen={handleSwipeableOpen}
            overshootRight={false}
            friction={2}
            rightThreshold={40}
        >
            <View style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                    <View
                        style={[
                            styles.categoryIconContainer,
                            { backgroundColor: transaction.categoryColor + '20' },
                        ]}
                    >
                        <Text style={styles.categoryIcon}>{transaction.categoryIcon}</Text>
                    </View>
                    <View style={styles.transactionInfo}>
                        <Text style={styles.categoryName}>{transaction.categoryName}</Text>
                        {transaction.note ? (
                            <Text style={styles.transactionNote} numberOfLines={1}>
                                {transaction.note}
                            </Text>
                        ) : null}
                        <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                    </View>
                </View>
                <Text
                    style={[
                        styles.transactionAmount,
                        transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                    ]}
                >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, currency)}
                </Text>
            </View>
        </Swipeable>
    );
}

// Memoize to prevent unnecessary re-renders
export default React.memo(SwipeableTransaction, (prevProps, nextProps) => {
    return (
        prevProps.transaction.id === nextProps.transaction.id &&
        prevProps.transaction.amount === nextProps.transaction.amount &&
        prevProps.transaction.note === nextProps.transaction.note &&
        prevProps.currency === nextProps.currency
    );
});

const styles = StyleSheet.create({
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.md,
    },
    categoryIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    categoryIcon: {
        fontSize: 22,
    },
    transactionInfo: {
        flex: 1,
    },
    categoryName: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    transactionNote: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    transactionDate: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },
    transactionAmount: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
    },
    incomeAmount: {
        color: colors.success,
    },
    expenseAmount: {
        color: colors.textPrimary,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: spacing.md,
    },
    actionButton: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
    },
    editButton: {
        backgroundColor: palette.blue500,
        borderTopLeftRadius: radius.lg,
        borderBottomLeftRadius: radius.lg,
    },
    deleteButton: {
        backgroundColor: palette.red500,
        borderTopRightRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
    },
    actionIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    actionText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.textInverse,
    },
});
