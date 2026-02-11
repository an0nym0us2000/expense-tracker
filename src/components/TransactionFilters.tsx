import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
} from 'react-native';
import { categoryRepo, paymentMethodRepo } from '../database';
import { colors, palette } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { fontFamily, fontSize } from '../theme/typography';
import type { Category, PaymentMethod } from '../types';

export interface TransactionFilters {
    type: 'all' | 'income' | 'expense';
    categoryIds: string[];
    paymentMethodIds: string[];
    dateRange: { start: string; end: string } | null;
}

interface TransactionFiltersProps {
    visible: boolean;
    onClose: () => void;
    filters: TransactionFilters;
    onApply: (filters: TransactionFilters) => void;
}

export default function TransactionFiltersModal({
    visible,
    onClose,
    filters,
    onApply,
}: TransactionFiltersProps) {
    const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const loadData = async () => {
        try {
            const [cats, methods] = await Promise.all([
                categoryRepo.getAll(),
                paymentMethodRepo.getAll(),
            ]);
            setCategories(cats);
            setPaymentMethods(methods);
        } catch (error) {
            console.error('Failed to load filter data:', error);
        }
    };

    const handleTypeChange = (type: 'all' | 'income' | 'expense') => {
        setLocalFilters({ ...localFilters, type });
    };

    const handleCategoryToggle = (categoryId: string) => {
        const categoryIds = localFilters.categoryIds.includes(categoryId)
            ? localFilters.categoryIds.filter((id) => id !== categoryId)
            : [...localFilters.categoryIds, categoryId];
        setLocalFilters({ ...localFilters, categoryIds });
    };

    const handlePaymentMethodToggle = (methodId: string) => {
        const paymentMethodIds = localFilters.paymentMethodIds.includes(methodId)
            ? localFilters.paymentMethodIds.filter((id) => id !== methodId)
            : [...localFilters.paymentMethodIds, methodId];
        setLocalFilters({ ...localFilters, paymentMethodIds });
    };

    const handleClearAll = () => {
        setLocalFilters({
            type: 'all',
            categoryIds: [],
            paymentMethodIds: [],
            dateRange: null,
        });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const activeFilterCount =
        (localFilters.type !== 'all' ? 1 : 0) +
        localFilters.categoryIds.length +
        localFilters.paymentMethodIds.length +
        (localFilters.dateRange ? 1 : 0);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Filters</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Transaction Type */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Transaction Type</Text>
                            <View style={styles.typeButtonsRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        localFilters.type === 'all' && styles.typeButtonActive,
                                    ]}
                                    onPress={() => handleTypeChange('all')}
                                >
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            localFilters.type === 'all' && styles.typeButtonTextActive,
                                        ]}
                                    >
                                        All
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        localFilters.type === 'income' && styles.typeButtonActive,
                                    ]}
                                    onPress={() => handleTypeChange('income')}
                                >
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            localFilters.type === 'income' && styles.typeButtonTextActive,
                                        ]}
                                    >
                                        Income
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        localFilters.type === 'expense' && styles.typeButtonActive,
                                    ]}
                                    onPress={() => handleTypeChange('expense')}
                                >
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            localFilters.type === 'expense' && styles.typeButtonTextActive,
                                        ]}
                                    >
                                        Expense
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Categories */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Categories {localFilters.categoryIds.length > 0 && `(${localFilters.categoryIds.length})`}
                            </Text>
                            <View style={styles.chipsContainer}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.chip,
                                            localFilters.categoryIds.includes(category.id) && styles.chipActive,
                                        ]}
                                        onPress={() => handleCategoryToggle(category.id)}
                                    >
                                        <Text style={styles.chipIcon}>{category.icon}</Text>
                                        <Text
                                            style={[
                                                styles.chipText,
                                                localFilters.categoryIds.includes(category.id) && styles.chipTextActive,
                                            ]}
                                        >
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Payment Methods */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Payment Methods {localFilters.paymentMethodIds.length > 0 && `(${localFilters.paymentMethodIds.length})`}
                            </Text>
                            <View style={styles.chipsContainer}>
                                {paymentMethods.map((method) => (
                                    <TouchableOpacity
                                        key={method.id}
                                        style={[
                                            styles.chip,
                                            localFilters.paymentMethodIds.includes(method.id) && styles.chipActive,
                                        ]}
                                        onPress={() => handlePaymentMethodToggle(method.id)}
                                    >
                                        <Text style={styles.chipIcon}>{method.icon}</Text>
                                        <Text
                                            style={[
                                                styles.chipText,
                                                localFilters.paymentMethodIds.includes(method.id) && styles.chipTextActive,
                                            ]}
                                        >
                                            {method.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={handleClearAll}
                            disabled={activeFilterCount === 0}
                        >
                            <Text
                                style={[
                                    styles.clearButtonText,
                                    activeFilterCount === 0 && styles.clearButtonTextDisabled,
                                ]}
                            >
                                Clear All
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={styles.applyButtonText}>
                                Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.gray100,
    },
    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: palette.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIcon: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    section: {
        marginTop: spacing.xl,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    typeButtonsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    typeButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        backgroundColor: palette.gray50,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeButtonActive: {
        backgroundColor: colors.primaryBg,
        borderColor: colors.primary,
    },
    typeButtonText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    typeButtonTextActive: {
        color: colors.primary,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.full,
        backgroundColor: palette.gray50,
        borderWidth: 2,
        borderColor: 'transparent',
        gap: spacing.xs,
    },
    chipActive: {
        backgroundColor: colors.primaryBg,
        borderColor: colors.primary,
    },
    chipIcon: {
        fontSize: 16,
    },
    chipText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    chipTextActive: {
        color: colors.primary,
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: palette.gray100,
    },
    clearButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: palette.gray50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButtonText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    clearButtonTextDisabled: {
        color: colors.textTertiary,
    },
    applyButton: {
        flex: 2,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyButtonText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textInverse,
    },
});
