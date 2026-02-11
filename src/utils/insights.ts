import type { TransactionWithCategory } from '../types';

export interface SpendingInsight {
    id: string;
    type: 'trend' | 'warning' | 'success' | 'info';
    title: string;
    message: string;
    icon: string;
}

/**
 * Analyze transactions and generate insights
 */
export function generateInsights(
    currentMonthTransactions: TransactionWithCategory[],
    previousMonthTransactions: TransactionWithCategory[],
    budgets: Array<{ categoryId: string; limitAmount: number; spent: number }>
): SpendingInsight[] {
    const insights: SpendingInsight[] = [];

    // Calculate totals
    const currentExpenses = currentMonthTransactions
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const previousExpenses = previousMonthTransactions
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const currentIncome = currentMonthTransactions
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);

    // 1. Spending Trend vs Last Month
    if (previousExpenses > 0) {
        const changePercent = ((currentExpenses - previousExpenses) / previousExpenses) * 100;
        if (changePercent > 20) {
            insights.push({
                id: 'trend-up',
                type: 'warning',
                title: 'Spending increased',
                message: `You spent ${Math.abs(changePercent).toFixed(0)}% more than last month`,
                icon: '📈',
            });
        } else if (changePercent < -20) {
            insights.push({
                id: 'trend-down',
                type: 'success',
                title: 'Great savings!',
                message: `You spent ${Math.abs(changePercent).toFixed(0)}% less than last month`,
                icon: '📉',
            });
        }
    }

    // 2. Average Daily Spending
    const daysInMonth = new Date().getDate();
    const avgDailySpending = currentExpenses / daysInMonth;
    insights.push({
        id: 'avg-daily',
        type: 'info',
        title: 'Daily average',
        message: `You're spending ${avgDailySpending.toFixed(2)} per day on average`,
        icon: '📊',
    });

    // 3. Budget Health
    const budgetsOverLimit = budgets.filter((b) => b.spent > b.limitAmount);
    if (budgetsOverLimit.length > 0) {
        insights.push({
            id: 'budget-warning',
            type: 'warning',
            title: 'Budget alert',
            message: `${budgetsOverLimit.length} ${budgetsOverLimit.length === 1 ? 'budget is' : 'budgets are'} over limit`,
            icon: '⚠️',
        });
    } else if (budgets.length > 0) {
        insights.push({
            id: 'budget-success',
            type: 'success',
            title: 'On track!',
            message: 'All budgets are within limits',
            icon: '✅',
        });
    }

    // 4. Income vs Expenses
    if (currentIncome > 0) {
        const savingsRate = ((currentIncome - currentExpenses) / currentIncome) * 100;
        if (savingsRate > 20) {
            insights.push({
                id: 'savings-great',
                type: 'success',
                title: 'Excellent savings!',
                message: `You're saving ${savingsRate.toFixed(0)}% of your income`,
                icon: '💰',
            });
        } else if (savingsRate < 0) {
            insights.push({
                id: 'savings-negative',
                type: 'warning',
                title: 'Spending more than earning',
                message: 'Consider reducing expenses',
                icon: '💸',
            });
        }
    }

    // 5. Most Expensive Category
    const categoryTotals: Record<string, { name: string; amount: number }> = {};
    currentMonthTransactions
        .filter((tx) => tx.type === 'expense')
        .forEach((tx) => {
            if (!categoryTotals[tx.categoryId]) {
                categoryTotals[tx.categoryId] = {
                    name: tx.categoryName || 'Unknown',
                    amount: 0,
                };
            }
            categoryTotals[tx.categoryId].amount += tx.amount;
        });

    const topCategory = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount)[0];
    if (topCategory && currentExpenses > 0) {
        const percentage = (topCategory.amount / currentExpenses) * 100;
        insights.push({
            id: 'top-category',
            type: 'info',
            title: 'Top spending category',
            message: `${topCategory.name} accounts for ${percentage.toFixed(0)}% of expenses`,
            icon: '🎯',
        });
    }

    // 6. Transaction Frequency
    const txCount = currentMonthTransactions.filter((tx) => tx.type === 'expense').length;
    if (txCount > 50) {
        insights.push({
            id: 'high-frequency',
            type: 'info',
            title: 'Frequent transactions',
            message: `You've made ${txCount} transactions this month`,
            icon: '🔄',
        });
    }

    return insights;
}

/**
 * Get spending prediction for end of month
 */
export function predictMonthEndSpending(
    currentMonthTransactions: TransactionWithCategory[]
): number {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();

    const currentExpenses = currentMonthTransactions
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

    // Simple linear projection
    const avgDailySpending = currentExpenses / daysPassed;
    return avgDailySpending * daysInMonth;
}

/**
 * Calculate budget health score (0-100)
 */
export function calculateBudgetHealthScore(
    budgets: Array<{ spent: number; limitAmount: number }>
): number {
    if (budgets.length === 0) return 100;

    const scores = budgets.map((budget) => {
        const usagePercent = (budget.spent / budget.limitAmount) * 100;
        if (usagePercent <= 80) return 100;
        if (usagePercent <= 100) return 80;
        if (usagePercent <= 120) return 50;
        return 20;
    });

    return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}
