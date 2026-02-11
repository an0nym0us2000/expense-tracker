import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamily, fontSize } from '../../theme/typography';

interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad';
    multiline?: boolean;
    numberOfLines?: number;
    secureTextEntry?: boolean;
    editable?: boolean;
    style?: ViewStyle;
    inputStyle?: TextStyle;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    onFocus?: () => void;
    onBlur?: () => void;
}

export function Input({
    value,
    onChangeText,
    placeholder,
    label,
    error,
    leftIcon,
    rightIcon,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    secureTextEntry = false,
    editable = true,
    style,
    inputStyle,
    autoCapitalize = 'sentences',
    onFocus,
    onBlur,
}: InputProps) {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.focused,
                    error && styles.errorBorder,
                    !editable && styles.disabled,
                ]}
            >
                {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        multiline ? styles.multiline : undefined,
                        leftIcon ? styles.inputWithLeftIcon : undefined,
                        rightIcon ? styles.inputWithRightIcon : undefined,
                        inputStyle,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textTertiary}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    secureTextEntry={secureTextEntry}
                    editable={editable}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => {
                        setIsFocused(true);
                        onFocus?.();
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        onBlur?.();
                    }}
                />
                {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: 'transparent',
        minHeight: 48,
    },
    focused: {
        borderColor: colors.borderFocused,
        backgroundColor: colors.background,
    },
    errorBorder: {
        borderColor: colors.error,
    },
    disabled: {
        opacity: 0.5,
    },
    input: {
        flex: 1,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputWithLeftIcon: {
        paddingLeft: spacing.xs,
    },
    inputWithRightIcon: {
        paddingRight: spacing.xs,
    },
    iconContainer: {
        paddingHorizontal: spacing.md,
    },
    errorText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
