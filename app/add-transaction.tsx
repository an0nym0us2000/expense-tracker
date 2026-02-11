import React, { useEffect, useState, useRef } from 'react';
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
    Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactionStore } from '../src/stores';
import { categoryRepo, paymentMethodRepo } from '../src/database';
import { colors, palette } from '../src/theme/colors';
import { spacing, radius, shadows } from '../src/theme/spacing';
import { fontFamily, fontSize } from '../src/theme/typography';
import { getToday } from '../src/utils';
import type { Category, PaymentMethod, TransactionType } from '../src/types';

export default function AddTransactionScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { addTransaction } = useTransactionStore();

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

    const amountInputRef = useRef<TextInput>(null);
    const dateInputRef = useRef<TextInput>(null);
    const noteInputRef = useRef<TextInput>(null);

    useEffect(() => {
        // Auto-focus amount input when screen mounts
        const timer = setTimeout(() => {
            amountInputRef.current?.focus();
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        categoryRepo.getByType(type).then((cats) => {
            setCategories(cats);
            setSelectedCategoryId('');
        });
        paymentMethodRepo.getAll().then((pms) => {
            setPaymentMethods(pms);
            const defaultPm = pms.find((p) => p.isDefault);
            if (defaultPm) setSelectedPaymentId(defaultPm.id);
        });
    }, [type]);

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
            await addTransaction({
                type,
                amount: parseFloat(amount),
                categoryId: selectedCategoryId,
                date,
                note: note.trim(),
                paymentMethodId: selectedPaymentId,
            });
            router.back();
        } catch (err) {
            Alert.alert('Error', 'Failed to add transaction. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Transaction</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Type Toggle */}
                <View style={styles.typeToggle}>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
                        onPress={() => setType('expense')}
                    >
                        <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
                            Expense
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
                        onPress={() => setType('income')}
                    >
                        <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
                            Income
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Amount */}
                <View style={styles.amountSection}>
                    <Text style={styles.amountSign}>{type === 'expense' ? '−' : '+'}</Text>
                    <TextInput
                        ref={amountInputRef}
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        placeholderTextColor={palette.gray400}
                        returnKeyType="next"
                        onSubmitEditing={() => dateInputRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                </View>
                {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

                {/* Category */}
                <Text style={styles.sectionLabel}>CATEGORY</Text>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryChip,
                                selectedCategoryId === cat.id && {
                                    backgroundColor: cat.color,
                                    borderColor: cat.color,
                                },
                            ]}
                            onPress={() => {
                                setSelectedCategoryId(cat.id);
                                setErrors((e) => ({ ...e, category: '' }));
                            }}
                        >
                            <Text style={styles.chipIcon}>{cat.icon}</Text>
                            <Text
                                style={[
                                    styles.chipLabel,
                                    selectedCategoryId === cat.id && { color: colors.textInverse },
                                ]}
                            >
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Date */}
                <Text style={styles.sectionLabel}>DATE</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>📅</Text>
                    <TextInput
                        ref={dateInputRef}
                        style={styles.inputField}
                        value={date}
                        onChangeText={(d) => {
                            setDate(d);
                            setErrors((e) => ({ ...e, date: '' }));
                        }}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={palette.gray400}
                        returnKeyType="next"
                        onSubmitEditing={() => noteInputRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                </View>

                {/* Payment Method */}
                <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
                {errors.payment && <Text style={styles.errorText}>{errors.payment}</Text>}
                <View style={styles.paymentRow}>
                    {paymentMethods.map((pm) => (
                        <TouchableOpacity
                            key={pm.id}
                            style={[
                                styles.paymentChip,
                                selectedPaymentId === pm.id && styles.paymentChipActive,
                            ]}
                            onPress={() => {
                                setSelectedPaymentId(pm.id);
                                setErrors((e) => ({ ...e, payment: '' }));
                            }}
                        >
                            <Text style={styles.paymentIcon}>{pm.icon}</Text>
                            <Text
                                style={[
                                    styles.paymentLabel,
                                    selectedPaymentId === pm.id && styles.paymentLabelActive,
                                ]}
                            >
                                {pm.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Note */}
                <Text style={styles.sectionLabel}>NOTE (OPTIONAL)</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>📝</Text>
                    <TextInput
                        ref={noteInputRef}
                        style={styles.inputField}
                        value={note}
                        onChangeText={setNote}
                        placeholder="What was this for?"
                        placeholderTextColor={palette.gray400}
                        returnKeyType="done"
                        onSubmitEditing={() => {
                            Keyboard.dismiss();
                            handleSubmit();
                        }}
                    />
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={
                            type === 'expense'
                                ? [palette.red400, palette.red500]
                                : [colors.primaryGradientStart, colors.primaryGradientEnd]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                        <Text style={styles.submitText}>
                            {isSubmitting
                                ? 'Adding...'
                                : type === 'expense'
                                    ? 'Add Expense'
                                    : 'Add Income'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: spacing.xxxl }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        backgroundColor: palette.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        fontSize: 18,
        color: colors.textSecondary,
    },
    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
    },

    // Type Toggle
    typeToggle: {
        flexDirection: 'row',
        backgroundColor: palette.gray100,
        borderRadius: radius.pill,
        padding: 4,
        marginBottom: spacing.xxl,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: radius.pill,
        alignItems: 'center',
    },
    typeBtnActiveExpense: {
        backgroundColor: palette.red400,
        shadowColor: palette.red500,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    typeBtnActiveIncome: {
        backgroundColor: palette.green400,
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    typeBtnText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    typeBtnTextActive: {
        color: colors.textInverse,
    },

    // Amount
    amountSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    amountSign: {
        fontFamily: fontFamily.bold,
        fontSize: 40,
        color: colors.textPrimary,
        marginRight: spacing.xs,
    },
    amountInput: {
        fontFamily: fontFamily.bold,
        fontSize: 40,
        color: colors.textPrimary,
        minWidth: 120,
        textAlign: 'center',
    },

    // Section
    sectionLabel: {
        fontFamily: fontFamily.bold,
        fontSize: 11,
        color: colors.textTertiary,
        letterSpacing: 1.2,
        marginBottom: spacing.sm,
        marginTop: spacing.xl,
    },
    errorText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.error,
        marginBottom: spacing.xs,
    },

    // Category Chips
    chipScroll: {
        marginBottom: spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: palette.gray200,
        marginRight: spacing.sm,
        gap: spacing.xs,
        backgroundColor: colors.backgroundSecondary,
    },
    chipIcon: { fontSize: 16 },
    chipLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },

    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.gray100,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    inputIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    inputField: {
        flex: 1,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        paddingVertical: spacing.md,
    },

    // Payment
    paymentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    paymentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: palette.gray100,
        gap: spacing.xs,
    },
    paymentChipActive: {
        backgroundColor: palette.green50,
        borderWidth: 1.5,
        borderColor: palette.green400,
    },
    paymentIcon: { fontSize: 16 },
    paymentLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    paymentLabelActive: {
        color: palette.green700,
    },

    // Submit
    submitBtn: {
        marginTop: spacing.xxl,
        borderRadius: radius.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    submitGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: radius.lg,
    },
    submitText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textInverse,
    },
});
