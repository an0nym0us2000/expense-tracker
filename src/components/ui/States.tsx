import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fontFamily, fontSize } from '../../theme/typography';
import { Button } from './Button';

// ─── Empty State ──────────────────────────────────────────

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{icon}</Text>
            <Text style={styles.emptyTitle}>{title}</Text>
            <Text style={styles.emptyMessage}>{message}</Text>
            {actionLabel && onAction && (
                <Button title={actionLabel} onPress={onAction} variant="secondary" size="sm" style={{ marginTop: spacing.lg }} />
            )}
        </View>
    );
}

// ─── Loading State ────────────────────────────────────────

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{message}</Text>
        </View>
    );
}

// ─── Error State ──────────────────────────────────────────

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>{message}</Text>
            {onRetry && <Button title="Try Again" onPress={onRetry} variant="outline" size="sm" style={{ marginTop: spacing.lg }} />}
        </View>
    );
}

// ─── Section Header ───────────────────────────────────────

interface SectionHeaderProps {
    title: string;
    rightAction?: React.ReactNode;
}

export function SectionHeader({ title, rightAction }: SectionHeaderProps) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {rightAction}
        </View>
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    emptyMessage: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxxl,
    },
    loadingText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginTop: spacing.lg,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxxl,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: spacing.lg,
    },
    errorTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    errorMessage: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    sectionTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
});
