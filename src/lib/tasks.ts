'use client';

import { useTaskCompletions } from './hooks/useTaskCompletions';
import { useStreak } from './hooks/useStreak';
import { useDelegation } from './hooks/useDelegation';

// ── Types ───────────────────────────────────────────────────

export interface TaskCompletion {
    taskId: string;
    completedAt: string;
    notes: string;
    delegatedTo?: string;
    delegatedAt?: string;
    isDelegated: boolean;
    followUpStatus?: 'pending' | 'verified';
    verifiedAt?: string;
    durationSeconds?: number;
}

export interface DelegationEvent {
    type: 'delegated' | 'cancelled' | 'verified';
    taskId: string;
    delegatedTo: string;
    timestamp: string;
}

// ── Period key helpers ──────────────────────────────────────

/** Formats a Date as YYYY-MM-DD using the device's local timezone (NOT UTC). */
export function toLocalDateString(d: Date = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function getDateKey(): string {
    return toLocalDateString();
}

export function getWeekKey(): string {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    return `W-${toLocalDateString(start)}`;
}

export function getMonthKey(): string {
    const now = new Date();
    return `M-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getPeriodKey(category: 'daily' | 'weekly' | 'monthly'): string {
    switch (category) {
        case 'daily': return getDateKey();
        case 'weekly': return getWeekKey();
        case 'monthly': return getMonthKey();
    }
}

// ── Re-export composable hooks ──────────────────────────────

export { useTaskCompletions } from './hooks/useTaskCompletions';
export { useStreak } from './hooks/useStreak';
export { useDelegation } from './hooks/useDelegation';

// ── Facade hook (backwards-compatible) ─────────────────────

/**
 * Thin facade that composes useTaskCompletions + useStreak + useDelegation.
 * All existing consumers continue to work without changes.
 * New code can import the individual hooks directly for lighter subscriptions.
 */
export function useTasks() {
    const {
        periodData, setPeriodData,
        isCompleted, isDelegated, toggleTask, updateNotes,
        getCompletionCount, getCompletion, getAllCompletions,
    } = useTaskCompletions();

    const { getStreak, updateStreak } = useStreak();

    const {
        delegateTask, undelegateTask, verifyDelegation,
        getDelegatedCount, getPendingFollowUpCount, delegationEvents,
    } = useDelegation(periodData, setPeriodData);

    return {
        isCompleted, isDelegated, toggleTask, delegateTask, undelegateTask, verifyDelegation,
        updateNotes, getCompletionCount, getDelegatedCount, getPendingFollowUpCount,
        getCompletion, getAllCompletions, getStreak, updateStreak, delegationEvents,
    };
}
