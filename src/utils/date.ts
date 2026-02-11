import { format, parseISO, isValid, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

export function formatDate(dateStr: string, fmt = 'MMM dd, yyyy'): string {
    try {
        const date = parseISO(dateStr);
        return isValid(date) ? format(date, fmt) : dateStr;
    } catch {
        return dateStr;
    }
}

export function formatShortDate(dateStr: string): string {
    return formatDate(dateStr, 'MMM dd');
}

export function formatMonthYear(month: number, year: number): string {
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMMM yyyy');
}

export function formatMonthShort(month: number, year: number): string {
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMM yyyy');
}

export function getCurrentMonth(): number {
    return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
    return new Date().getFullYear();
}

export function getPreviousMonth(month: number, year: number): { month: number; year: number } {
    const d = subMonths(new Date(year, month - 1, 1), 1);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export function getNextMonth(month: number, year: number): { month: number; year: number } {
    const d = addMonths(new Date(year, month - 1, 1), 1);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export function getToday(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

export function getMonthStart(month: number, year: number): string {
    return format(startOfMonth(new Date(year, month - 1, 1)), 'yyyy-MM-dd');
}

export function getMonthEnd(month: number, year: number): string {
    return format(endOfMonth(new Date(year, month - 1, 1)), 'yyyy-MM-dd');
}

export function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
}

export function getRelativeTime(dateStr: string): string {
    const date = parseISO(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateStr, 'MMM dd');
}
