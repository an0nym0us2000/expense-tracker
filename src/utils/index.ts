export { formatCurrency, formatCompactCurrency, getCurrencySymbol } from './currency';
export {
    formatDate,
    formatShortDate,
    formatMonthYear,
    formatMonthShort,
    getCurrentMonth,
    getCurrentYear,
    getPreviousMonth,
    getNextMonth,
    getToday,
    getMonthStart,
    getMonthEnd,
    getDaysInMonth,
    getRelativeTime,
} from './date';

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Generate greeting based on time of day
 */
export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}
