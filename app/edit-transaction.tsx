import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactionStore } from '../src/stores';
import { categoryRepo, paymentMethodRepo, transactionRepo } from '../src/database';
import { colors, palette } from '../src/theme/colors';
import { spacing, radius, shadows } from '../src/theme/spacing';
import { fontFamily, fontSize } from '../src/theme/typography';
import { getToday } from '../src/utils';
import type { Category, PaymentMethod, TransactionType, TransactionWithCategory } from '../src/types';
import { DatePicker } from '../src/components/ui';

export default function EditTransactionScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();
    const transactionId = params.id as string;

    const { updateTransaction, deleteTransaction } = useTransactionStore();

    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState<TransactionWithCategory | null>(null);
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(getToday());
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedPaymentId, setSelectedPaymentId] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadTransaction();
    }, [transactionId]);

    useEffect(() => {
        categoryRepo.getByType(type).then(setCategories);
        paymentMethodRepo.getAll().then(setPaymentMethods);
    }, [type]);

    const loadTransaction = async () => {
        if (!transactionId) {
            Alert.alert('Error', 'Transaction not found');
            router.back();
            return;
        }

        try {
            const txn = await transactionRepo.getById(transactionId);
            if (!txn) {
                Alert.alert('Error', 'Transaction not found');
                router.back();
                return;
            }

            setTransaction(txn);
            setType(txn.type);
            setAmount(txn.amount.toString());
            setNote(txn.note);
            setDate(txn.date);
            setSelectedCategoryId(txn.categoryId);
            setSelectedPaymentId(txn.paymentMethodId);
        } catch (error) {
            console.error('Error loading transaction:', error);
            Alert.alert('Error', 'Failed to load transaction');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            errs.amount = 'Enter a valid amount';
        }
        if (!selectedCategoryId) errs.category = 'Select a category';
        if (!selectedPaymentId) errs.payment = 'Select a payment method';
        if (!date) errs.date = 'Select a date';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await updateTransaction(transactionId, {
                type,
                amount: parseFloat(amount),
                categoryId: selectedCategoryId,
                date,
                note: note.trim(),
                paymentMethodId: selectedPaymentId,
            });
            Alert.alert('Success', 'Transaction updated successfully');
            router.back();
        } catch (err) {
            Alert.alert('Error', 'Failed to update transaction. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTransaction(transactionId);
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete transaction');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Transaction</Text>
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                        <Text style={styles.deleteBtnText}>🗑</Text>
                    </TouchableOpacity>
                </View>

                {/* Type Selector */}
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
                        onPress={() => setType('expense')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.typeBtnText,
                                type === 'expense' && styles.typeBtnTextActive,
                            ]}
                        >
                            Expense
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'income' && styles.typeBtnActive]}
                        onPress={() => setType('income')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.typeBtnText,
                                type === 'income' && styles.typeBtnTextActive,
                            ]}
                        >
                            Income
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Amount</Text>
                    <View
                        style={[
                            styles.amountInputContainer,
                            errors.amount && styles.inputError,
                        ]}
                    >
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            placeholderTextColor={palette.gray400}
                        />
                    </View>
                    {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                </View>

                {/* Category */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Category</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                    >
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    selectedCategoryId === cat.id && styles.categoryChipActive,
                                    { borderColor: cat.color },
                                ]}
                                onPress={() => setSelectedCategoryId(cat.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                                <Text
                                    style={[
                                        styles.categoryChipLabel,
                                        selectedCategoryId === cat.id &&
                                            styles.categoryChipLabelActive,
                                    ]}
                                >
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Payment Method</Text>
                    <View style={styles.paymentGrid}>
                        {paymentMethods.map((pm) => (
                            <TouchableOpacity
                                key={pm.id}
                                style={[
                                    styles.paymentChip,
                                    selectedPaymentId === pm.id && styles.paymentChipActive,
                                ]}
                                onPress={() => setSelectedPaymentId(pm.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.paymentChipIcon}>{pm.icon}</Text>
                                <Text
                                    style={[
                                        styles.paymentChipLabel,
                                        selectedPaymentId === pm.id &&
                                            styles.paymentChipLabelActive,
                                    ]}
                                >
                                    {pm.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.payment && <Text style={styles.errorText}>{errors.payment}</Text>}
                </View>

                {/* Date */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Date</Text>
                    <DatePicker value={date} onChange={setDate} />
                    {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
                </View>

                {/* Note */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Note (Optional)</Text>
                    <TextInput
                        style={styles.noteInput}
                        value={note}
                        onChangeText={setNote}
                        placeholder="Add a note..."
                        placeholderTextColor={palette.gray400}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitBtnGradient}
                    >
                        <Text style={styles.submitBtnText}>
                            {isSubmitting ? 'Updating...' : 'Update Transaction'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    content: {
        paddingHorizontal: spacing.xl,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    closeBtnText: {
        fontSize: 20,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    deleteBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: palette.red50,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    deleteBtnText: {
        fontSize: 20,
    },
    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
    },

    // Type Selector
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.lg,
        padding: 4,
        marginBottom: spacing.xl,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: radius.md,
    },
    typeBtnActive: {
        backgroundColor: colors.background,
        ...shadows.sm,
    },
    typeBtnText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    typeBtnTextActive: {
        color: colors.textPrimary,
        fontFamily: fontFamily.semiBold,
    },

    // Sections
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },

    // Amount Input
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.xl,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: colors.error,
    },
    currencySymbol: {
        fontFamily: fontFamily.bold,
        fontSize: 28,
        color: colors.primary,
        marginRight: spacing.sm,
    },
    amountInput: {
        flex: 1,
        fontFamily: fontFamily.bold,
        fontSize: 28,
        color: colors.textPrimary,
        paddingVertical: spacing.lg,
    },

    // Category
    categoryScroll: {
        marginBottom: spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        marginRight: spacing.sm,
        borderWidth: 2,
        gap: spacing.xs,
    },
    categoryChipActive: {
        backgroundColor: palette.green50,
    },
    categoryChipIcon: {
        fontSize: 18,
    },
    categoryChipLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    categoryChipLabelActive: {
        color: colors.primary,
    },

    // Payment Method
    paymentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    paymentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
        gap: spacing.xs,
    },
    paymentChipActive: {
        backgroundColor: palette.green50,
        borderColor: colors.primary,
    },
    paymentChipIcon: {
        fontSize: 18,
    },
    paymentChipLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    paymentChipLabelActive: {
        color: colors.primary,
    },

    // Note Input
    noteInput: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        minHeight: 80,
    },

    // Error
    errorText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },

    // Submit Button
    submitBtn: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginTop: spacing.lg,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: radius.lg,
    },
    submitBtnText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textInverse,
        letterSpacing: 0.3,
    },
});
