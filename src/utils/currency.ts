import type { CurrencyCode } from '../types';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
};

export function formatCurrency(amount: number, currency?: CurrencyCode | string): string {
    const curr = (currency || 'USD') as CurrencyCode;
    const symbol = CURRENCY_SYMBOLS[curr] || '$';
    const formatted = Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatCompactCurrency(amount: number, currency?: CurrencyCode | string): string {
    const curr = (currency || 'USD') as CurrencyCode;
    const symbol = CURRENCY_SYMBOLS[curr] || '$';
    if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
    return formatCurrency(amount, curr);
}

export function getCurrencySymbol(currency: CurrencyCode): string {
    return CURRENCY_SYMBOLS[currency] || '$';
}
