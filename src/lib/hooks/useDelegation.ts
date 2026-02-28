'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth';
import { TaskCompletion, DelegationEvent, getPeriodKey, getDateKey } from '../tasks';

interface PeriodData {
    completions: Record<string, TaskCompletion>;
}

/**
 * Manages delegation lifecycle: delegate, verify, undelegate.
 * Subscribes to today's delegation events.
 * Takes periodData from useTaskCompletions to read/write completion records.
 */
export function useDelegation(
    periodData: Record<string, PeriodData>,
    setPeriodData: (updater: (prev: Record<string, PeriodData>) => Record<string, PeriodData>) => void,
) {
    const { user } = useAuth();
    const [delegationEvents, setDelegationEvents] = useState<DelegationEvent[]>([]);

    // Listen to today's delegation events
    useEffect(() => {
        if (!user) return;

        const today = getDateKey();
        const eventsRef = doc(db, 'users', user.uid, 'delegationEvents', today);
        const unsub = onSnapshot(eventsRef, (snap) => {
            if (snap.exists()) {
                setDelegationEvents((snap.data().events || []) as DelegationEvent[]);
            } else {
                setDelegationEvents([]);
            }
        }, (err) => {
            console.warn('Delegation events listener error:', err.message);
        });

        return unsub;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);

    const logDelegationEvent = useCallback(async (event: DelegationEvent) => {
        if (!user) return;
        const today = getDateKey();
        const eventsRef = doc(db, 'users', user.uid, 'delegationEvents', today);
        try {
            await setDoc(eventsRef, { events: arrayUnion(event) }, { merge: true });
        } catch (err) {
            console.warn('Delegation event log failed:', err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);

    const delegateTask = useCallback(async (taskId: string, category: 'daily' | 'weekly' | 'monthly', delegatedTo: string) => {
        if (!user) return;
        const periodKey = getPeriodKey(category);
        const docRef = doc(db, 'users', user.uid, 'taskCompletions', periodKey);

        const current = periodData[periodKey]?.completions || {};
        const updated = {
            ...current,
            [taskId]: {
                taskId,
                completedAt: new Date().toISOString(),
                notes: current[taskId]?.notes || '',
                isDelegated: true,
                delegatedTo,
                delegatedAt: new Date().toISOString(),
                followUpStatus: 'pending' as const,
            },
        };

        setPeriodData(prev => ({ ...prev, [periodKey]: { completions: updated } }));
        try { await setDoc(docRef, { completions: updated }, { merge: true }); } catch (err) { console.warn('Firestore write error:', err); }

        logDelegationEvent({ type: 'delegated', taskId, delegatedTo, timestamp: new Date().toISOString() });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, periodData, logDelegationEvent, setPeriodData]);

    const verifyDelegation = useCallback(async (taskId: string, category: 'daily' | 'weekly' | 'monthly') => {
        if (!user) return;
        const periodKey = getPeriodKey(category);
        const docRef = doc(db, 'users', user.uid, 'taskCompletions', periodKey);

        const current = periodData[periodKey]?.completions || {};
        const existing = current[taskId];
        if (!existing) return;

        const updated = {
            ...current,
            [taskId]: {
                ...existing,
                followUpStatus: 'verified' as const,
                verifiedAt: new Date().toISOString(),
            },
        };

        setPeriodData(prev => ({ ...prev, [periodKey]: { completions: updated } }));
        try { await setDoc(docRef, { completions: updated }, { merge: true }); } catch (err) { console.warn('Firestore write error:', err); }

        logDelegationEvent({ type: 'verified', taskId, delegatedTo: existing.delegatedTo || '', timestamp: new Date().toISOString() });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, periodData, logDelegationEvent, setPeriodData]);

    const undelegateTask = useCallback(async (taskId: string, category: 'daily' | 'weekly' | 'monthly') => {
        if (!user) return;
        const periodKey = getPeriodKey(category);
        const docRef = doc(db, 'users', user.uid, 'taskCompletions', periodKey);

        const current = periodData[periodKey]?.completions || {};
        const existing = current[taskId];
        const updated = { ...current };
        delete updated[taskId];

        setPeriodData(prev => ({ ...prev, [periodKey]: { completions: updated } }));
        try { await setDoc(docRef, { completions: updated }, { merge: true }); } catch (err) { console.warn('Firestore write error:', err); }

        if (existing?.delegatedTo) {
            logDelegationEvent({ type: 'cancelled', taskId, delegatedTo: existing.delegatedTo, timestamp: new Date().toISOString() });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, periodData, logDelegationEvent, setPeriodData]);

    const getDelegatedCount = useCallback((taskIds: string[], category: 'daily' | 'weekly' | 'monthly') => {
        const periodKey = getPeriodKey(category);
        return taskIds.filter(id => periodData[periodKey]?.completions?.[id]?.isDelegated).length;
    }, [periodData]);

    const getPendingFollowUpCount = useCallback((taskIds: string[], category: 'daily' | 'weekly' | 'monthly') => {
        const periodKey = getPeriodKey(category);
        return taskIds.filter(id => {
            const c = periodData[periodKey]?.completions?.[id];
            return c?.isDelegated && c?.followUpStatus !== 'verified';
        }).length;
    }, [periodData]);

    return {
        delegateTask, undelegateTask, verifyDelegation,
        getDelegatedCount, getPendingFollowUpCount, delegationEvents,
    };
}
