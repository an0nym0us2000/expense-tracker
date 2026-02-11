import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Animated,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTransactionStore, useAppStore } from '../src/stores';
import { colors, palette } from '../src/theme/colors';
import { spacing, radius } from '../src/theme/spacing';
import { fontFamily, fontSize } from '../src/theme/typography';
import { formatCurrency, formatDate } from '../src/utils';
import type { TransactionWithCategory } from '../src/types';
import TransactionFiltersModal, { type TransactionFilters } from '../src/components/TransactionFilters';
import SwipeableTransaction from '../src/components/SwipeableTransaction';

export default function TransactionsScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [displayedCount, setDisplayedCount] = useState(50);
    const [filters, setFilters] = useState<TransactionFilters>({
        type: 'all',
        categoryIds: [],
        paymentMethodIds: [],
        dateRange: null,
    });
    const [deletedTransaction, setDeletedTransaction] = useState<TransactionWithCategory | null>(null);
    const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
    const snackbarOpacity = useRef(new Animated.Value(0)).current;
    const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const ITEMS_PER_PAGE = 50;

    const transactions = useTransactionStore((s) => s.transactions);
    const loadTransactions = useTransactionStore((s) => s.loadTransactions);
    const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
    const addTransaction = useTransactionStore((s) => s.addTransaction);
    const currency = useAppStore((s) => s.settings.currency);

    useEffect(() => {
        loadData();
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    useEffect(() => {
        applyFilters();
    }, [debouncedSearchQuery, transactions, filters]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            await loadTransactions();
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await loadTransactions();
            setDisplayedCount(ITEMS_PER_PAGE);
        } finally {
            setIsRefreshing(false);
        }
    }, [loadTransactions]);

    const handleLoadMore = useCallback(() => {
        if (displayedCount < filteredTransactions.length) {
            setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredTransactions.length));
        }
    }, [displayedCount, filteredTransactions.length]);

    const applyFilters = useCallback(() => {
        let filtered = [...transactions];

        // Apply type filter
        if (filters.type !== 'all') {
            filtered = filtered.filter((tx) => tx.type === filters.type);
        }

        // Apply category filter
        if (filters.categoryIds.length > 0) {
            filtered = filtered.filter((tx) => filters.categoryIds.includes(tx.categoryId));
        }

        // Apply payment method filter
        if (filters.paymentMethodIds.length > 0) {
            filtered = filtered.filter((tx) => filters.paymentMethodIds.includes(tx.paymentMethodId));
        }

        // Apply search query (debounced)
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter((tx) => {
                const noteMatch = tx.note?.toLowerCase().includes(query);
                const categoryMatch = tx.categoryName?.toLowerCase().includes(query);
                const amountMatch = tx.amount.toString().includes(query);
                return noteMatch || categoryMatch || amountMatch;
            });
        }

        setFilteredTransactions(filtered);
        setDisplayedCount(ITEMS_PER_PAGE);
    }, [transactions, filters, debouncedSearchQuery]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleApplyFilters = (newFilters: TransactionFilters) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            type: 'all',
            categoryIds: [],
            paymentMethodIds: [],
            dateRange: null,
        });
    };

    const activeFilterCount = useMemo(
        () =>
            (filters.type !== 'all' ? 1 : 0) +
            filters.categoryIds.length +
            filters.paymentMethodIds.length +
            (filters.dateRange ? 1 : 0),
        [filters]
    );

    // Paginated data for display
    const paginatedTransactions = useMemo(
        () => filteredTransactions.slice(0, displayedCount),
        [filteredTransactions, displayedCount]
    );

    const showSnackbar = () => {
        setShowUndoSnackbar(true);
        Animated.timing(snackbarOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        // Auto-hide after 5 seconds
        undoTimeoutRef.current = setTimeout(() => {
            hideSnackbar();
        }, 5000);
    };

    const hideSnackbar = () => {
        Animated.timing(snackbarOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setShowUndoSnackbar(false);
            setDeletedTransaction(null);
        });

        if (undoTimeoutRef.current) {
            clearTimeout(undoTimeoutRef.current);
            undoTimeoutRef.current = null;
        }
    };

    const handleDelete = async (id: string) => {
        const txToDelete = transactions.find((tx) => tx.id === id);
        if (!txToDelete) return;

        setDeletedTransaction(txToDelete);
        await deleteTransaction(id);
        showSnackbar();
    };

    const handleUndo = async () => {
        if (!deletedTransaction) return;

        hideSnackbar();
        const { id, createdAt, updatedAt, categoryName, categoryIcon, categoryColor, ...txInput } = deletedTransaction;
        await addTransaction(txInput);
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedIds(new Set());
    };

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        const allIds = new Set(filteredTransactions.map((tx) => tx.id));
        setSelectedIds(allIds);
    };

    const handleDeselectAll = () => {
        setSelectedIds(new Set());
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setShowDeleteDialog(true);
    };

    const confirmBulkDelete = async () => {
        setShowDeleteDialog(false);

        for (const id of selectedIds) {
            await deleteTransaction(id);
        }

        setSelectedIds(new Set());
        setSelectionMode(false);
    };

    const renderTransaction = useCallback(({ item }: { item: TransactionWithCategory }) => {
        if (selectionMode) {
            const isSelected = selectedIds.has(item.id);
            return (
                <TouchableOpacity
                    style={[styles.selectableCard, isSelected && styles.selectedCard]}
                    onPress={() => handleToggleSelect(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.checkbox}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.transactionLeft}>
                            <View
                                style={[
                                    styles.categoryIconContainer,
                                    { backgroundColor: item.categoryColor + '20' },
                                ]}
                            >
                                <Text style={styles.categoryIcon}>{item.categoryIcon}</Text>
                            </View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.categoryName}>{item.categoryName}</Text>
                                {item.note ? (
                                    <Text style={styles.transactionNote} numberOfLines={1}>
                                        {item.note}
                                    </Text>
                                ) : null}
                                <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
                            </View>
                        </View>
                        <Text
                            style={[
                                styles.transactionAmount,
                                item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                            ]}
                        >
                            {item.type === 'income' ? '+' : '-'}
                            {formatCurrency(item.amount, currency)}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <SwipeableTransaction
                transaction={item}
                onDelete={handleDelete}
                currency={currency}
            />
        );
    }, [selectionMode, selectedIds, handleDelete, currency]);

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'Your transactions will appear here'}
            </Text>
        </View>
    );

    return (
        <GestureHandlerRootView style={styles.flex}>
            <View style={styles.container}>
                <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                {selectionMode ? (
                    <>
                        <TouchableOpacity onPress={toggleSelectionMode} style={styles.backButton}>
                            <Text style={styles.backIcon}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>
                            {selectedIds.size} selected
                        </Text>
                        <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
                            <Text style={styles.selectAllText}>All</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>All Transactions</Text>
                        <TouchableOpacity onPress={toggleSelectionMode} style={styles.selectButton}>
                            <Text style={styles.selectButtonText}>Select</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search transactions..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Filter Button */}
                <TouchableOpacity
                    style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
                    onPress={() => setShowFilters(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.filterIcon}>⚙️</Text>
                    {activeFilterCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Results Count */}
            <View style={styles.resultsContainer}>
                <Text style={styles.resultsText}>
                    {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                    {searchQuery || activeFilterCount > 0 ? ' found' : ''}
                </Text>
                {activeFilterCount > 0 && (
                    <TouchableOpacity onPress={handleClearFilters}>
                        <Text style={styles.clearFiltersText}>Clear filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Transactions List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={paginatedTransactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        displayedCount < filteredTransactions.length ? (
                            <View style={styles.loadMoreContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.loadMoreText}>
                                    Loading more... ({displayedCount}/{filteredTransactions.length})
                                </Text>
                            </View>
                        ) : null
                    }
                    maxToRenderPerBatch={20}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={20}
                    windowSize={10}
                    removeClippedSubviews={true}
                />
            )}

                {/* Filters Modal */}
                <TransactionFiltersModal
                    visible={showFilters}
                    onClose={() => setShowFilters(false)}
                    filters={filters}
                    onApply={handleApplyFilters}
                />

                {/* Bulk Actions Footer */}
                {selectionMode && selectedIds.size > 0 && (
                    <View style={styles.bulkActionsFooter}>
                        <TouchableOpacity onPress={handleDeselectAll} style={styles.deselectButton}>
                            <Text style={styles.deselectButtonText}>Deselect All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleBulkDelete} style={styles.bulkDeleteButton}>
                            <Text style={styles.bulkDeleteButtonText}>
                                Delete ({selectedIds.size})
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Delete Confirmation Dialog */}
                {showDeleteDialog && (
                    <View style={styles.dialogOverlay}>
                        <View style={styles.dialog}>
                            <Text style={styles.dialogTitle}>Delete Transactions?</Text>
                            <Text style={styles.dialogMessage}>
                                Are you sure you want to delete {selectedIds.size} transaction
                                {selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
                            </Text>
                            <View style={styles.dialogActions}>
                                <TouchableOpacity
                                    style={styles.dialogCancelButton}
                                    onPress={() => setShowDeleteDialog(false)}
                                >
                                    <Text style={styles.dialogCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dialogDeleteButton}
                                    onPress={confirmBulkDelete}
                                >
                                    <Text style={styles.dialogDeleteText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Undo Snackbar */}
                {showUndoSnackbar && (
                    <Animated.View style={[styles.snackbar, { opacity: snackbarOpacity }]}>
                        <View style={styles.snackbarContent}>
                            <Text style={styles.snackbarText}>Transaction deleted</Text>
                            <TouchableOpacity onPress={handleUndo} style={styles.undoButton}>
                                <Text style={styles.undoButtonText}>UNDO</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl + 12,
        paddingBottom: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: palette.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 20,
        color: colors.textPrimary,
    },
    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
    },
    headerRight: {
        width: 60,
    },
    selectButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
        backgroundColor: palette.gray100,
    },
    selectButtonText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    selectAllButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
        backgroundColor: colors.primaryBg,
    },
    selectAllText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.gray50,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        height: 48,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    clearButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: palette.gray200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearIcon: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: radius.lg,
        backgroundColor: palette.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    filterButtonActive: {
        backgroundColor: colors.primaryBg,
    },
    filterIcon: {
        fontSize: 18,
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    filterBadgeText: {
        fontFamily: fontFamily.bold,
        fontSize: 11,
        color: colors.textInverse,
    },
    resultsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    resultsText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    clearFiltersText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    snackbar: {
        position: 'absolute',
        bottom: spacing.xl,
        left: spacing.lg,
        right: spacing.lg,
        backgroundColor: palette.gray900,
        borderRadius: radius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    snackbarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    snackbarText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textInverse,
    },
    undoButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    undoButtonText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.primary,
    },
    selectableCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryBg,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        marginRight: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
    },
    checkmark: {
        fontSize: 16,
        color: colors.primary,
        fontFamily: fontFamily.bold,
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.md,
    },
    categoryIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    categoryIcon: {
        fontSize: 22,
    },
    transactionInfo: {
        flex: 1,
    },
    categoryName: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    transactionNote: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    transactionDate: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },
    transactionAmount: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
    },
    incomeAmount: {
        color: colors.success,
    },
    expenseAmount: {
        color: colors.textPrimary,
    },
    bulkActionsFooter: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: palette.gray100,
    },
    deselectButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: palette.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deselectButtonText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    bulkDeleteButton: {
        flex: 2,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: palette.red500,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bulkDeleteButtonText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textInverse,
    },
    dialogOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialog: {
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        padding: spacing.xl,
        marginHorizontal: spacing.xl,
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    dialogTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    dialogMessage: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    dialogActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    dialogCancelButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: palette.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogCancelText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    dialogDeleteButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: palette.red500,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogDeleteText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textInverse,
    },
    loadMoreContainer: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    loadMoreText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});
