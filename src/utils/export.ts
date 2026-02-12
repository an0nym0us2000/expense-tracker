import { Paths, File } from 'expo-file-system';
import { EncodingType } from 'expo-file-system/build/ExpoFileSystem.types';
import * as Sharing from 'expo-sharing';
import { transactionRepo } from '../database';
import type { TransactionWithCategory } from '../types';

/**
 * Converts transactions to CSV format
 */
export const transactionsToCSV = (transactions: TransactionWithCategory[]): string => {
    // CSV Header
    const header = 'Date,Type,Category,Amount,Payment Method,Note\n';

    // CSV Rows
    const rows = transactions.map((tx) => {
        const date = tx.date;
        const type = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
        const category = tx.categoryName || 'Unknown';
        const amount = tx.amount.toString();
        const paymentMethod = 'Cash'; // Could fetch from paymentMethodId if needed
        const note = `"${(tx.note || '').replace(/"/g, '""')}"`;  // Escape quotes in notes

        return `${date},${type},${category},${amount},${paymentMethod},${note}`;
    }).join('\n');

    return header + rows;
};

/**
 * Export all transactions to CSV file
 */
export const exportTransactionsToCSV = async (): Promise<void> => {
    try {
        // Get all transactions
        const transactions = await transactionRepo.getAll(10000, 0); // Get a large number

        if (transactions.length === 0) {
            throw new Error('No transactions to export');
        }

        // Convert to CSV
        const csvContent = transactionsToCSV(transactions);

        // Create filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const fileName = `transactions_${timestamp}.csv`;
        const file = new File(Paths.document, fileName);

        // Write to file
        await file.write(csvContent);

        // Share the file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(file.uri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Transactions',
                UTI: 'public.comma-separated-values-text',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }

        // Clean up the file after sharing
        await file.delete();
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw error;
    }
};

/**
 * Export transactions for a specific date range to CSV
 */
export const exportTransactionsByDateRange = async (
    startDate: string,
    endDate: string
): Promise<void> => {
    try {
        const transactions = await transactionRepo.getByDateRange(startDate, endDate);

        if (transactions.length === 0) {
            throw new Error('No transactions found in this date range');
        }

        const csvContent = transactionsToCSV(transactions);
        const fileName = `transactions_${startDate}_to_${endDate}.csv`;
        const file = new File(Paths.document, fileName);

        await file.write(csvContent);

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(file.uri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Transactions',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }

        await file.delete();
    } catch (error) {
        console.error('Error exporting date range:', error);
        throw error;
    }
};
