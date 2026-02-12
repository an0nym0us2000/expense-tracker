import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transactionRepo, budgetRepo, goalRepo, categoryRepo, paymentMethodRepo } from '../database';
import { getDatabase } from '../database/connection';

interface BackupData {
    version: string;
    timestamp: string;
    settings: any;
    transactions: any[];
    budgets: any[];
    goals: any[];
    categories: any[];
    paymentMethods: any[];
}

const BACKUP_VERSION = '1.0.0';

/**
 * Create a complete backup of all app data
 */
export const createBackup = async (): Promise<void> => {
    try {
        // Get settings from AsyncStorage
        const settingsStr = await AsyncStorage.getItem('@expense_tracker_settings');
        const settings = settingsStr ? JSON.parse(settingsStr) : {};

        // Get all data from database
        const [transactions, budgets, goals, categories, paymentMethods] = await Promise.all([
            transactionRepo.getAll(100000, 0),
            budgetRepo.getAll ? budgetRepo.getAll() : [],
            goalRepo.getAll(),
            categoryRepo.getAll ? categoryRepo.getAll() : [],
            paymentMethodRepo.getAll(),
        ]);

        // Create backup object
        const backupData: BackupData = {
            version: BACKUP_VERSION,
            timestamp: new Date().toISOString(),
            settings,
            transactions,
            budgets,
            goals,
            categories,
            paymentMethods,
        };

        // Convert to JSON
        const jsonContent = JSON.stringify(backupData, null, 2);

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const fileName = `sprout_backup_${timestamp}.json`;
        const file = new File(Paths.document, fileName);

        // Write to file
        await file.write(jsonContent);

        // Share the backup file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(file.uri, {
                mimeType: 'application/json',
                dialogTitle: 'Save Backup',
                UTI: 'public.json',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }

        // Clean up after sharing
        await file.delete();
    } catch (error) {
        console.error('Error creating backup:', error);
        throw error;
    }
};

/**
 * Restore data from a backup file
 */
export const restoreFromBackup = async (): Promise<void> => {
    try {
        // Pick a backup file
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            throw new Error('No file selected');
        }

        const pickedFileUri = result.assets[0].uri;

        // Read the backup file
        const pickedFile = new File(pickedFileUri);
        const fileContent = await pickedFile.text();
        const backupData: BackupData = JSON.parse(fileContent);

        // Validate backup version
        if (!backupData.version || !backupData.timestamp) {
            throw new Error('Invalid backup file format');
        }

        // Get database connection
        const db = await getDatabase();

        // Clear existing data (in a transaction for safety)
        await db.execAsync(`
            DELETE FROM "transaction";
            DELETE FROM budget;
            DELETE FROM goal;
        `);

        // Restore transactions
        for (const tx of backupData.transactions || []) {
            await transactionRepo.create({
                type: tx.type,
                amount: tx.amount,
                categoryId: tx.categoryId,
                date: tx.date,
                note: tx.note || '',
                paymentMethodId: tx.paymentMethodId,
            });
        }

        // Restore budgets
        for (const budget of backupData.budgets || []) {
            if (budgetRepo.create) {
                await budgetRepo.create({
                    month: budget.month,
                    year: budget.year,
                    categoryId: budget.categoryId,
                    limitAmount: budget.limitAmount,
                });
            }
        }

        // Restore goals
        for (const goal of backupData.goals || []) {
            await goalRepo.create({
                title: goal.title,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount || 0,
                deadline: goal.deadline || '',
                icon: goal.icon,
            });
        }

        // Restore settings
        if (backupData.settings) {
            await AsyncStorage.setItem(
                '@expense_tracker_settings',
                JSON.stringify(backupData.settings)
            );
        }
    } catch (error) {
        console.error('Error restoring backup:', error);
        throw error;
    }
};

/**
 * Get backup info without restoring
 */
export const getBackupInfo = async (fileUri: string): Promise<BackupData> => {
    try {
        const file = new File(fileUri);
        const fileContent = await file.text();
        const backupData: BackupData = JSON.parse(fileContent);
        return backupData;
    } catch (error) {
        console.error('Error reading backup info:', error);
        throw error;
    }
};
