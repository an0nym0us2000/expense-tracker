import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing, shadows } from '../../theme/spacing';
import { fontFamily, fontSize } from '../../theme/typography';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    rightAction?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    elevated?: boolean;
}

export function Card({ children, title, subtitle, rightAction, style, elevated = false }: CardProps) {
    return (
        <View style={[styles.card, elevated && shadows.md, style]}>
            {(title || rightAction) && (
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        {title && <Text style={styles.title}>{title}</Text>}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {rightAction}
                </View>
            )}
            {children}
        </View>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    icon?: string;
    color?: string;
    bgColor?: string;
    trend?: { value: number; isPositive: boolean };
    style?: ViewStyle;
}

export function StatCard({ label, value, icon, color = colors.primary, bgColor, trend, style }: StatCardProps) {
    return (
        <View style={[styles.statCard, shadows.sm, style]}>
            {icon && (
                <View style={[styles.statIcon, { backgroundColor: bgColor || colors.primaryBg }]}>
                    <Text style={styles.statIconText}>{icon}</Text>
                </View>
            )}
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            {trend && (
                <View style={styles.trendContainer}>
                    <Text style={[styles.trendText, { color: trend.isPositive ? colors.success : colors.error }]}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBg,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
    subtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    statCard: {
        backgroundColor: colors.cardBg,
        borderRadius: radius.lg,
        padding: spacing.lg,
        flex: 1,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    statIconText: {
        fontSize: 20,
    },
    statLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
        marginBottom: spacing.xxs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
    },
    trendContainer: {
        marginTop: spacing.xs,
    },
    trendText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
    },
});
