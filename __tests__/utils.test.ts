import {
    getCurrentMonth,
    getCurrentYear,
    getToday,
    getPreviousMonth,
    getNextMonth,
    getDaysInMonth,
    getRelativeTime,
} from '../src/utils/date';
import { clamp, percentage, truncate, capitalize, getGreeting } from '../src/utils';

describe('Date Utils', () => {
    test('getCurrentMonth returns 1-12', () => {
        const month = getCurrentMonth();
        expect(month).toBeGreaterThanOrEqual(1);
        expect(month).toBeLessThanOrEqual(12);
    });

    test('getCurrentYear returns reasonable year', () => {
        const year = getCurrentYear();
        expect(year).toBeGreaterThanOrEqual(2024);
    });

    test('getToday returns YYYY-MM-DD format', () => {
        const today = getToday();
        expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('getPreviousMonth wraps around', () => {
        expect(getPreviousMonth(1, 2024)).toEqual({ month: 12, year: 2023 });
        expect(getPreviousMonth(6, 2024)).toEqual({ month: 5, year: 2024 });
    });

    test('getNextMonth wraps around', () => {
        expect(getNextMonth(12, 2024)).toEqual({ month: 1, year: 2025 });
        expect(getNextMonth(6, 2024)).toEqual({ month: 7, year: 2024 });
    });

    test('getDaysInMonth returns correct days', () => {
        expect(getDaysInMonth(2, 2024)).toBe(29); // leap year
        expect(getDaysInMonth(2, 2023)).toBe(28);
        expect(getDaysInMonth(1, 2024)).toBe(31);
        expect(getDaysInMonth(4, 2024)).toBe(30);
    });
});

describe('General Utils', () => {
    test('clamp works correctly', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-1, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
    });

    test('percentage calculates correctly', () => {
        expect(percentage(50, 100)).toBe(50);
        expect(percentage(25, 200)).toBe(12.5);
        expect(percentage(0, 0)).toBe(0);
    });

    test('truncate shortens text', () => {
        expect(truncate('Hello World', 5)).toBe('Hello…');
        expect(truncate('Hi', 5)).toBe('Hi');
    });

    test('capitalize works', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('world')).toBe('World');
    });

    test('getGreeting returns a string', () => {
        const greeting = getGreeting();
        expect(['Good Morning', 'Good Afternoon', 'Good Evening']).toContain(greeting);
    });
});
