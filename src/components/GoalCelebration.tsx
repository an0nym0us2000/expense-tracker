import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, palette } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { fontFamily, fontSize } from '../theme/typography';

interface GoalCelebrationProps {
    visible: boolean;
    goalTitle: string;
    goalAmount: number;
    onClose: () => void;
    onSetNewGoal?: () => void;
}

export default function GoalCelebration({
    visible,
    goalTitle,
    goalAmount,
    onClose,
    onSetNewGoal,
}: GoalCelebrationProps) {
    const confettiRef = useRef<any>(null);

    useEffect(() => {
        if (visible) {
            // Trigger confetti and haptic feedback
            setTimeout(() => {
                confettiRef.current?.start();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 100);
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <ConfettiCannon
                    ref={confettiRef}
                    count={200}
                    origin={{ x: -10, y: 0 }}
                    fadeOut
                    explosionSpeed={350}
                    fallSpeed={2500}
                />

                <View style={styles.content}>
                    {/* Celebration Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.celebrationIcon}>🎉</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Goal Achieved!</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        Congratulations! You've successfully completed your goal:
                    </Text>

                    {/* Goal Details */}
                    <View style={styles.goalCard}>
                        <Text style={styles.goalTitle}>{goalTitle}</Text>
                        <Text style={styles.goalAmount}>${goalAmount.toLocaleString()}</Text>
                    </View>

                    {/* Motivational Message */}
                    <Text style={styles.motivationText}>
                        Keep up the great work! Your dedication is paying off.
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        {onSetNewGoal && (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => {
                                    onClose();
                                    onSetNewGoal();
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.secondaryButtonText}>Set New Goal</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryButtonGradient}
                            >
                                <Text style={styles.primaryButtonText}>Continue</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        backgroundColor: colors.card,
        borderRadius: radius.xxl,
        padding: spacing.xxl,
        marginHorizontal: spacing.xl,
        maxWidth: 400,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    celebrationIcon: {
        fontSize: 56,
    },
    title: {
        fontFamily: fontFamily.bold,
        fontSize: 28,
        color: colors.textPrimary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    message: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    goalCard: {
        backgroundColor: colors.primaryBg,
        borderRadius: radius.lg,
        padding: spacing.lg,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.lg,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    goalTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        color: colors.primary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    goalAmount: {
        fontFamily: fontFamily.bold,
        fontSize: 32,
        color: colors.primary,
    },
    motivationText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textTertiary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        fontStyle: 'italic',
    },
    actions: {
        width: '100%',
        gap: spacing.md,
    },
    primaryButton: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonGradient: {
        paddingVertical: spacing.md + 2,
        alignItems: 'center',
        borderRadius: radius.lg,
    },
    primaryButtonText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textInverse,
        letterSpacing: 0.5,
    },
    secondaryButton: {
        paddingVertical: spacing.md + 2,
        borderRadius: radius.lg,
        backgroundColor: palette.gray100,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
});
