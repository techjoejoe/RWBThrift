import { describe, it, expect, vi } from 'vitest';

// Mock firebase before importing anything that uses it
vi.mock('@/lib/firebase', () => ({
    auth: {},
    db: {},
    storage: {},
    default: {},
}));

// Mock auth hook to prevent Firebase initialization
vi.mock('@/lib/auth', () => ({
    useAuth: () => ({ user: null, isAuthenticated: false }),
}));

import { getDateKey, getWeekKey, getMonthKey, getPeriodKey, toLocalDateString } from '@/lib/tasks';

describe('Period Key Generation', () => {
    describe('getDateKey', () => {
        it('returns YYYY-MM-DD format', () => {
            const key = getDateKey();
            expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('matches today\'s local date', () => {
            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            expect(getDateKey()).toBe(today);
        });

        it('toLocalDateString returns local YYYY-MM-DD', () => {
            const d = new Date(2026, 0, 15); // Jan 15, 2026 local
            expect(toLocalDateString(d)).toBe('2026-01-15');
        });
    });

    describe('getWeekKey', () => {
        it('returns W-YYYY-MM-DD format', () => {
            const key = getWeekKey();
            expect(key).toMatch(/^W-\d{4}-\d{2}-\d{2}$/);
        });

        it('returns a consistent start-of-week date', () => {
            const key = getWeekKey();
            // The key should be deterministic — calling it again gives the same result
            expect(getWeekKey()).toBe(key);

            // The key date should parse to a valid date
            const mondayStr = key.replace('W-', '');
            const mondayDate = new Date(mondayStr);
            expect(mondayDate.getTime()).not.toBeNaN();
        });
    });

    describe('getMonthKey', () => {
        it('returns M-YYYY-MM format', () => {
            const key = getMonthKey();
            expect(key).toMatch(/^M-\d{4}-\d{2}$/);
        });

        it('matches current month', () => {
            const now = new Date();
            const expected = `M-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            expect(getMonthKey()).toBe(expected);
        });

        it('pads single-digit months', () => {
            const key = getMonthKey();
            const month = key.split('-')[2];
            expect(month.length).toBe(2);
        });
    });

    describe('getPeriodKey', () => {
        it('returns date key for daily', () => {
            const key = getPeriodKey('daily');
            expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('returns week key for weekly', () => {
            const key = getPeriodKey('weekly');
            expect(key).toMatch(/^W-\d{4}-\d{2}-\d{2}$/);
        });

        it('returns month key for monthly', () => {
            const key = getPeriodKey('monthly');
            expect(key).toMatch(/^M-\d{4}-\d{2}$/);
        });
    });
});
