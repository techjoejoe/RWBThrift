'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth';
import { TaskCompletion, getPeriodKey, getDateKey, getWeekKey, getMonthKey } from '../tasks';

interface PeriodData {
    completions: Record<string, TaskCompletion>;
}

/**
 * Subscribes to task completion data for the current day/week/month.
 * Provides toggle, notes update, and query functions.
 */
export function useTaskCompletions() {
    const { user } = useAuth();
    const [periodData, setPeriodData] = useState<Record<string, PeriodData>>({});

    // Listen to current periods in Firestore
    useEffect(() => {
        if (!user) return;

        const periods = [getDateKey(), getWeekKey(), getMonthKey()];
        const unsubscribers: (() => void)[] = [];

        for (const period of periods) {
            const docRef = doc(db, 'users', user.uid, 'taskCompletions', period);
            const unsub = onSnapshot(docRef, (snap) => {
                if (snap.exists()) {
                    setPeriodData(prev => ({ ...prev, [period]: snap.data() as PeriodData }));
                } else {
                    setPeriodData(prev => ({ ...prev, [period]: { completions: {} } }));
                }
            }, (err) => {
                console.warn(`Firestore listener error for ${period}:`, err.message);
            });
            unsubscribers.push(unsub);
        }

        return () => unsubscribers.forEach(u => u());
    }, [user]);

    /** A task is completed only if directly done OR delegated + verified */
    const isCompleted = useCallback((taskId: string, category: 'daily' | 'weekly' | 'monthly') => {
        const periodKey = getPeriodKey(category);
        const completion = periodData[periodKey]?.completions?.[taskId];
        if (!completion) return false;
        if (completion.isDelegated) return completion.followUpStatus === 'verified';
        return true;
    }, [periodData]);

    const isDelegated = useCallback((taskId: string, category: 'daily' | 'weekly' | 'monthly') => {
        const periodKey = getPeriodKey(category);
        const completion = periodData[periodKey]?.completions?.[taskId];
        return !!completion?.isDelegated;
    }, [periodData]);

    const toggleTask = useCallback(async (taskId: string, category: 'daily' | 'weekly' | 'monthly', durationSeconds?: number) => {
        if (!user) return;
        const periodKey = getPeriodKey(category);
        const docRef = doc(db, 'users', user.uid, 'taskCompletions', periodKey);

        const current = periodData[periodKey]?.completions || {};
        const updated = { ...current };

        if (updated[taskId]) {
            delete updated[taskId];
        } else {
            updated[taskId] = {
                taskId,
                completedAt: new Date().toISOString(),
                notes: '',
                isDelegated: false,
                ...(durationSeconds !== undefined && { durationSeconds }),
            };
        }

        setPeriodData(prev => ({ ...prev, [periodKey]: { completions: updated } }));
        try { await setDoc(docRef, { completions: updated }, { merge: true }); } catch (err) { console.warn('Firestore write error:', err); }
    }, [user, periodData]);

    const updateNotes = useCallback(async (taskId: string, category: 'daily' | 'weekly' | 'monthly', notes: string) => {
        if (!user) return;
        const periodKey = getPeriodKey(category);
        const current = periodData[periodKey]?.completions || {};
        const existing = current[taskId];
        if (!existing) return;

        const updated = { ...current, [taskId]: { ...existing, notes } };
        setPeriodData(prev => ({ ...prev, [periodKey]: { completions: updated } }));

        const docRef = doc(db, 'users', user.uid, 'taskCompletions', periodKey);
        try { await setDoc(docRef, { completions: updated }, { merge: true }); } catch (err) { console.warn('Firestore write error:', err); }
    }, [user, periodData]);

    const getCompletionCount = useCallback((taskIds: string[], category: 'daily' | 'weekly' | 'monthly') => {
        return taskIds.filter(id => isCompleted(id, category)).length;
    }, [isCompleted]);

    const getCompletion = useCallback((taskId: string, category: 'daily' | 'weekly' | 'monthly'): TaskCompletion | null => {
        const periodKey = getPeriodKey(category);
        return periodData[periodKey]?.completions?.[taskId] || null;
    }, [periodData]);

    const getAllCompletions = useCallback((category: 'daily' | 'weekly' | 'monthly'): Record<string, TaskCompletion> => {
        const periodKey = getPeriodKey(category);
        return periodData[periodKey]?.completions || {};
    }, [periodData]);

    return {
        periodData, setPeriodData, isCompleted, isDelegated, toggleTask, updateNotes,
        getCompletionCount, getCompletion, getAllCompletions,
    };
}
