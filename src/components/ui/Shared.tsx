import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing, shadows } from '../../theme/spacing';
import { fontFamily, fontSize } from '../../theme/typography';

interface TransactionItemProps {
    icon: string;
    categoryName: string;
    note: string;
    amount: string;
    date: string;
    type: 'income' | 'expense';
    categoryColor: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export function TransactionItem({
    icon,
    categoryName,
    note,
    amount,
    date,
    type,
    categoryColor,
    onPress,
    style,
}: TransactionItemProps) {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.6}
            disabled={!onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
                <Text style={styles.icon}>{icon}</Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.category} numberOfLines={1}>{categoryName}</Text>
                <Text style={styles.note} numberOfLines={1}>{note || 'No note'}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={[styles.amount, type === 'income' ? styles.income : styles.expense]}>
                    {type === 'income' ? '+' : '-'}{amount}
                </Text>
                <Text style={styles.date}>{date}</Text>
            </View>
        </TouchableOpacity>
    );
}

interface ProgressBarProps {
    progress: number;
    color?: string;
    backgroundColor?: string;
    height?: number;
    style?: ViewStyle;
}

export function ProgressBar({
    progress,
    color = colors.primary,
    backgroundColor = colors.backgroundTertiary,
    height = 8,
    style,
}: ProgressBarProps) {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const isOverBudget = progress > 100;

    return (
        <View style={[styles.progressBg, { backgroundColor, height, borderRadius: height / 2 }, style]}>
            <View
                style={[
                    styles.progressFill,
                    {
                        width: `${Math.min(clampedProgress, 100)}%`,
                        backgroundColor: isOverBudget ? colors.error : color,
                        height,
                        borderRadius: height / 2,
                    },
                ]}
            />
        </View>
    );
}

interface AvatarProps {
    name: string;
    size?: number;
    style?: ViewStyle;
}

export function Avatar({ name, size = 48, style }: AvatarProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <View
            style={[
                styles.avatar,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                style,
            ]}
        >
            <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
        </View>
    );
}

interface DividerProps {
    style?: ViewStyle;
}

export function Divider({ style }: DividerProps) {
    return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 22,
    },
    details: {
        flex: 1,
        gap: 2,
    },
    category: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    note: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textTertiary,
    },
    amountContainer: {
        alignItems: 'flex-end',
        gap: 2,
    },
    amount: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
    },
    income: {
        color: colors.income,
    },
    expense: {
        color: colors.expense,
    },
    date: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },
    progressBg: {
        width: '100%',
        overflow: 'hidden',
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
    avatar: {
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: fontFamily.bold,
        color: colors.primaryDark,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginVertical: spacing.sm,
    },
});
