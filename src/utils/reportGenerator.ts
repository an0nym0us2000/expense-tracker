import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { TransactionWithCategory, CategoryBreakdown } from '../types';
import { formatCurrency } from './currency';

export interface MonthlyReportData {
    month: string;
    year: number;
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
    categoryBreakdown: CategoryBreakdown[];
    topExpenseCategories: Array<{ name: string; amount: number; percentage: number }>;
    topIncomeCategories: Array<{ name: string; amount: number }>;
    savingsRate: number;
}

/**
 * Generate a monthly report summary
 */
export function generateMonthlyReportData(
    transactions: TransactionWithCategory[],
    month: string,
    year: number
): MonthlyReportData {
    const expenses = transactions.filter((tx) => tx.type === 'expense');
    const incomes = transactions.filter((tx) => tx.type === 'income');

    const totalIncome = incomes.reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

    // Category breakdown for expenses
    const expenseCategoryMap: Record<string, { name: string; amount: number; count: number }> = {};
    expenses.forEach((tx) => {
        if (!expenseCategoryMap[tx.categoryId]) {
            expenseCategoryMap[tx.categoryId] = {
                name: tx.categoryName || 'Unknown',
                amount: 0,
                count: 0,
            };
        }
        expenseCategoryMap[tx.categoryId].amount += tx.amount;
        expenseCategoryMap[tx.categoryId].count++;
    });

    const categoryBreakdown: CategoryBreakdown[] = Object.entries(expenseCategoryMap).map(
        ([categoryId, data]) => ({
            categoryId,
            categoryName: data.name,
            categoryIcon: '📊',
            categoryColor: '#4CAF50',
            amount: data.amount,
            percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
            count: data.count,
            transactionCount: data.count,
        })
    );

    const topExpenseCategories = categoryBreakdown
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map((cat) => ({
            name: cat.categoryName,
            amount: cat.amount,
            percentage: cat.percentage,
        }));

    // Income categories
    const incomeCategoryMap: Record<string, { name: string; amount: number }> = {};
    incomes.forEach((tx) => {
        if (!incomeCategoryMap[tx.categoryId]) {
            incomeCategoryMap[tx.categoryId] = {
                name: tx.categoryName || 'Unknown',
                amount: 0,
            };
        }
        incomeCategoryMap[tx.categoryId].amount += tx.amount;
    });

    const topIncomeCategories = Object.entries(incomeCategoryMap)
        .map(([_, data]) => data)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

    return {
        month,
        year,
        totalIncome,
        totalExpense,
        netBalance,
        transactionCount: transactions.length,
        categoryBreakdown,
        topExpenseCategories,
        topIncomeCategories,
        savingsRate,
    };
}

/**
 * Generate HTML report
 */
export function generateHTMLReport(data: MonthlyReportData, currency: string = 'USD'): string {
    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Report - ${monthNames[parseInt(data.month) - 1]} ${data.year}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #7f8c8d;
            margin-bottom: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid;
        }
        .summary-card.income { border-color: #27ae60; }
        .summary-card.expense { border-color: #e74c3c; }
        .summary-card.balance { border-color: #3498db; }
        .card-label {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 5px;
        }
        .card-value {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
        }
        .section {
            margin-top: 30px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: #f8f9fa;
            margin-bottom: 8px;
            border-radius: 6px;
        }
        .category-name {
            font-weight: 500;
            color: #2c3e50;
        }
        .category-amount {
            font-weight: bold;
            color: #e74c3c;
        }
        .bar {
            height: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            margin-top: 8px;
            overflow: hidden;
        }
        .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #81C784);
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Monthly Financial Report</h1>
        <div class="subtitle">${monthNames[parseInt(data.month) - 1]} ${data.year}</div>

        <div class="summary-grid">
            <div class="summary-card income">
                <div class="card-label">Total Income</div>
                <div class="card-value">${formatCurrency(data.totalIncome, currency)}</div>
            </div>
            <div class="summary-card expense">
                <div class="card-label">Total Expenses</div>
                <div class="card-value">${formatCurrency(data.totalExpense, currency)}</div>
            </div>
            <div class="summary-card balance">
                <div class="card-label">Net Balance</div>
                <div class="card-value">${formatCurrency(data.netBalance, currency)}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Overview</div>
            <div class="category-item">
                <span class="category-name">Total Transactions</span>
                <span class="category-amount">${data.transactionCount}</span>
            </div>
            <div class="category-item">
                <span class="category-name">Savings Rate</span>
                <span class="category-amount">${data.savingsRate.toFixed(1)}%</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Top Expense Categories</div>
            ${data.topExpenseCategories
                .map(
                    (cat) => `
                <div class="category-item">
                    <span class="category-name">${cat.name}</span>
                    <span class="category-amount">${formatCurrency(cat.amount, currency)}</span>
                </div>
                <div class="bar">
                    <div class="bar-fill" style="width: ${cat.percentage}%"></div>
                </div>
            `
                )
                .join('')}
        </div>

        ${
            data.topIncomeCategories.length > 0
                ? `
        <div class="section">
            <div class="section-title">Income Sources</div>
            ${data.topIncomeCategories
                .map(
                    (cat) => `
                <div class="category-item">
                    <span class="category-name">${cat.name}</span>
                    <span class="category-amount" style="color: #27ae60;">${formatCurrency(cat.amount, currency)}</span>
                </div>
            `
                )
                .join('')}
        </div>
        `
                : ''
        }

        <div class="footer">
            Generated by Sprout - Your Personal Finance Tracker
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Export monthly report as HTML file
 */
export async function exportMonthlyReport(
    reportData: MonthlyReportData,
    currency: string = 'USD'
): Promise<void> {
    try {
        const html = generateHTMLReport(reportData, currency);
        const fileName = `monthly_report_${reportData.year}_${reportData.month.padStart(2, '0')}.html`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(fileUri, html, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/html',
                dialogTitle: 'Share Monthly Report',
                UTI: 'public.html',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }

        // Clean up after sharing
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
        console.error('Error exporting monthly report:', error);
        throw error;
    }
}
