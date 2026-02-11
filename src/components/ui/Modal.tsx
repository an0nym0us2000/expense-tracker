import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    ScrollView,
    Dimensions,
} from 'react-native';
import { colors, palette } from '../../theme/colors';
import { radius, spacing, shadows } from '../../theme/spacing';
import { fontFamily, fontSize } from '../../theme/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Modal ────────────────────────────────────────────────

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function AppModal({ visible, onClose, title, children }: AppModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.modalHandle} />
                    {title && <Text style={styles.modalTitle}>{title}</Text>}
                    {children}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ─── Bottom Sheet ─────────────────────────────────────────

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    snapPoint?: number;
}

export function BottomSheet({
    visible,
    onClose,
    title,
    children,
    snapPoint = 0.5,
}: BottomSheetProps) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.sheetOverlay} onPress={onClose}>
                <Pressable
                    style={[styles.sheetContent, { maxHeight: SCREEN_HEIGHT * snapPoint }]}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.sheetHandle} />
                    {title && (
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={styles.sheetClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.sheetBody}
                    >
                        {children}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ─── Confirm Dialog ───────────────────────────────────────

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    destructive?: boolean;
}

export function ConfirmDialog({
    visible,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    destructive = false,
}: ConfirmDialogProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <Pressable style={styles.overlay} onPress={onCancel}>
                <Pressable style={styles.dialogContent} onPress={(e) => e.stopPropagation()}>
                    <Text style={styles.dialogTitle}>{title}</Text>
                    <Text style={styles.dialogMessage}>{message}</Text>
                    <View style={styles.dialogActions}>
                        <TouchableOpacity style={styles.dialogCancelBtn} onPress={onCancel}>
                            <Text style={styles.dialogCancelText}>{cancelLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.dialogConfirmBtn, destructive && styles.dialogDestructiveBtn]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.dialogConfirmText, destructive && styles.dialogDestructiveText]}>
                                {confirmLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxl,
    },
    modalContent: {
        backgroundColor: colors.background,
        borderRadius: radius.xl,
        padding: spacing.xxl,
        width: '100%',
        maxHeight: SCREEN_HEIGHT * 0.8,
        ...shadows.xl,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: palette.gray300,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },

    // Bottom Sheet
    sheetOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    sheetContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        paddingBottom: spacing.xxxl,
        ...shadows.xl,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: palette.gray300,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
    sheetTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
    },
    sheetClose: {
        fontSize: 20,
        color: colors.textTertiary,
        padding: spacing.sm,
    },
    sheetBody: {
        paddingHorizontal: spacing.xl,
    },

    // Dialog
    dialogContent: {
        backgroundColor: colors.background,
        borderRadius: radius.xl,
        padding: spacing.xxl,
        width: '100%',
        maxWidth: 340,
        ...shadows.xl,
    },
    dialogTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    dialogMessage: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: spacing.xxl,
    },
    dialogActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    dialogCancelBtn: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.backgroundTertiary,
        alignItems: 'center',
    },
    dialogCancelText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    dialogConfirmBtn: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    dialogConfirmText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textInverse,
    },
    dialogDestructiveBtn: {
        backgroundColor: colors.error,
    },
    dialogDestructiveText: {
        color: colors.textInverse,
    },
});
