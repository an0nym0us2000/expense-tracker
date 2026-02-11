import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamily, fontSize } from '../../theme/typography';

interface PillProps {
    label: string;
    active?: boolean;
    color?: string;
    onPress?: () => void;
    icon?: string;
    style?: ViewStyle;
    size?: 'sm' | 'md';
}

export function Pill({ label, active = false, color, onPress, icon, style, size = 'md' }: PillProps) {
    const pillColor = color || colors.primary;

    return (
        <TouchableOpacity
            style={[
                styles.pill,
                size === 'sm' && styles.pillSm,
                active
                    ? { backgroundColor: pillColor }
                    : { backgroundColor: `${pillColor}15`, borderColor: `${pillColor}30`, borderWidth: 1 },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            {icon && <Text style={[styles.icon, size === 'sm' && styles.iconSm]}>{icon}</Text>}
            <Text
                style={[
                    styles.label,
                    size === 'sm' && styles.labelSm,
                    { color: active ? colors.textInverse : pillColor },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        gap: spacing.xs,
    },
    pillSm: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    icon: {
        fontSize: 14,
    },
    iconSm: {
        fontSize: 12,
    },
    label: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
    },
    labelSm: {
        fontSize: fontSize.xs,
    },
});
