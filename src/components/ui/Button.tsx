import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamily, fontSize } from '../../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    fullWidth = false,
    style,
    textStyle,
}: ButtonProps) {
    const buttonStyles = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const labelStyles = [
        styles.label,
        styles[`label_${variant}`],
        styles[`label_${size}`],
        disabled && styles.labelDisabled,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'danger' ? colors.textInverse : colors.primary}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Text style={labelStyles}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderRadius: radius.md,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.primaryLight,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: colors.error,
    },
    size_sm: {
        height: 36,
        paddingHorizontal: spacing.lg,
    },
    size_md: {
        height: 48,
        paddingHorizontal: spacing.xl,
    },
    size_lg: {
        height: 56,
        paddingHorizontal: spacing.xxl,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    label: {
        fontFamily: fontFamily.semiBold,
    },
    label_primary: {
        color: colors.textInverse,
        fontSize: fontSize.md,
    },
    label_secondary: {
        color: colors.primary,
        fontSize: fontSize.md,
    },
    label_outline: {
        color: colors.primary,
        fontSize: fontSize.md,
    },
    label_ghost: {
        color: colors.primary,
        fontSize: fontSize.md,
    },
    label_danger: {
        color: colors.textInverse,
        fontSize: fontSize.md,
    },
    label_sm: {
        fontSize: fontSize.sm,
    },
    label_md: {
        fontSize: fontSize.md,
    },
    label_lg: {
        fontSize: fontSize.lg,
    },
    labelDisabled: {
        opacity: 0.7,
    },
});
