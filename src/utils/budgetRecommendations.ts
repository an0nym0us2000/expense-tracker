/**
 * Budget Recommendations using the 50/30/20 rule
 * 50% - Needs (essential expenses)
 * 30% - Wants (discretionary spending)
 * 20% - Savings/Investments
 */

export interface BudgetRecommendation {
    categoryId: string;
    categoryName: string;
    recommendedAmount: number;
    percentage: number;
    type: 'needs' | 'wants' | 'savings';
}

const NEEDS_CATEGORIES = ['groceries', 'housing', 'utilities', 'transportation', 'healthcare'];
const WANTS_CATEGORIES = ['dining', 'entertainment', 'shopping', 'hobbies', 'subscriptions'];
const SAVINGS_CATEGORIES = ['savings', 'investments', 'emergency fund'];

/**
 * Get budget recommendations based on monthly income
 */
export function getBudgetRecommendations(
    monthlyIncome: number,
    availableCategories: Array<{ id: string; name: string; type: string }>
): BudgetRecommendation[] {
    if (monthlyIncome <= 0) return [];

    const recommendations: BudgetRecommendation[] = [];

    // Calculate totals
    const needsBudget = monthlyIncome * 0.5;
    const wantsBudget = monthlyIncome * 0.3;
    const savingsBudget = monthlyIncome * 0.2;

    // Categorize available categories
    const needsCategories = availableCategories.filter((cat) =>
        NEEDS_CATEGORIES.some((need) => cat.name.toLowerCase().includes(need))
    );
    const wantsCategories = availableCategories.filter((cat) =>
        WANTS_CATEGORIES.some((want) => cat.name.toLowerCase().includes(want))
    );
    const savingsCategories = availableCategories.filter((cat) =>
        SAVINGS_CATEGORIES.some((save) => cat.name.toLowerCase().includes(save))
    );

    // Distribute needs budget
    if (needsCategories.length > 0) {
        const perCategoryNeeds = needsBudget / needsCategories.length;
        needsCategories.forEach((cat) => {
            recommendations.push({
                categoryId: cat.id,
                categoryName: cat.name,
                recommendedAmount: Math.round(perCategoryNeeds),
                percentage: 50 / needsCategories.length,
                type: 'needs',
            });
        });
    }

    // Distribute wants budget
    if (wantsCategories.length > 0) {
        const perCategoryWants = wantsBudget / wantsCategories.length;
        wantsCategories.forEach((cat) => {
            recommendations.push({
                categoryId: cat.id,
                categoryName: cat.name,
                recommendedAmount: Math.round(perCategoryWants),
                percentage: 30 / wantsCategories.length,
                type: 'wants',
            });
        });
    }

    // Distribute savings budget
    if (savingsCategories.length > 0) {
        const perCategorySavings = savingsBudget / savingsCategories.length;
        savingsCategories.forEach((cat) => {
            recommendations.push({
                categoryId: cat.id,
                categoryName: cat.name,
                recommendedAmount: Math.round(perCategorySavings),
                percentage: 20 / savingsCategories.length,
                type: 'savings',
            });
        });
    }

    return recommendations;
}

/**
 * Get simple budget recommendation for a single category
 */
export function getSingleCategoryRecommendation(
    monthlyIncome: number,
    categoryName: string
): number {
    const categoryLower = categoryName.toLowerCase();

    // Needs - 50%
    if (NEEDS_CATEGORIES.some((need) => categoryLower.includes(need))) {
        // Distribute 50% among typical needs categories (5 categories)
        return Math.round((monthlyIncome * 0.5) / 5);
    }

    // Wants - 30%
    if (WANTS_CATEGORIES.some((want) => categoryLower.includes(want))) {
        // Distribute 30% among typical wants categories (5 categories)
        return Math.round((monthlyIncome * 0.3) / 5);
    }

    // Savings - 20%
    if (SAVINGS_CATEGORIES.some((save) => categoryLower.includes(save))) {
        // Distribute 20% among typical savings categories (2 categories)
        return Math.round((monthlyIncome * 0.2) / 2);
    }

    // Default: distribute remaining as discretionary
    return Math.round((monthlyIncome * 0.1) / 3);
}

/**
 * Analyze spending patterns and adjust recommendations
 */
export function getAdjustedRecommendations(
    baseRecommendations: BudgetRecommendation[],
    actualSpending: Record<string, number>
): BudgetRecommendation[] {
    return baseRecommendations.map((rec) => {
        const actualAmount = actualSpending[rec.categoryId] || 0;

        // If spending is significantly different, adjust recommendation
        if (actualAmount > rec.recommendedAmount * 1.5) {
            // User is spending much more - recommend closer to actual
            return {
                ...rec,
                recommendedAmount: Math.round(actualAmount * 1.1), // 10% buffer
            };
        }

        return rec;
    });
}
