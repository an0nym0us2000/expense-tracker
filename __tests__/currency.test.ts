import { formatCurrency, formatCompactCurrency, getCurrencySymbol } from '../src/utils/currency';

describe('Currency Utils', () => {
    test('formatCurrency formats USD correctly', () => {
        expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    test('formatCurrency formats negative amounts', () => {
        expect(formatCurrency(-50.00, 'USD')).toBe('-$50.00');
    });

    test('formatCurrency formats INR correctly', () => {
        expect(formatCurrency(1000, 'INR')).toBe('₹1,000.00');
    });

    test('formatCurrency formats zero', () => {
        expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    test('formatCompactCurrency shows K for thousands', () => {
        expect(formatCompactCurrency(5000, 'USD')).toBe('$5.0K');
    });

    test('formatCompactCurrency shows M for millions', () => {
        expect(formatCompactCurrency(1500000, 'USD')).toBe('$1.5M');
    });

    test('formatCompactCurrency shows normal for small amounts', () => {
        expect(formatCompactCurrency(50, 'USD')).toBe('$50.00');
    });

    test('getCurrencySymbol returns correct symbols', () => {
        expect(getCurrencySymbol('USD')).toBe('$');
        expect(getCurrencySymbol('EUR')).toBe('€');
        expect(getCurrencySymbol('GBP')).toBe('£');
        expect(getCurrencySymbol('INR')).toBe('₹');
    });
});
