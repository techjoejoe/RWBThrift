'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth';
import { getDateKey, toLocalDateString } from '../tasks';

interface StreakData {
    streak: number;
    lastFullCompletionDate: string | null;
}

/**
 * Subscribes to the streak document and provides update logic.
 */
export function useStreak() {
    const { user } = useAuth();
    const [streakData, setStreakData] = useState<StreakData>({ streak: 0, lastFullCompletionDate: null });

    useEffect(() => {
        if (!user) return;

        const streakRef = doc(db, 'users', user.uid, 'stats', 'streak');
        const unsub = onSnapshot(streakRef, (snap) => {
            if (snap.exists()) {
                setStreakData(snap.data() as StreakData);
            }
        }, (err) => {
            console.warn('Firestore streak listener error:', err.message);
        });

        return unsub;
    }, [user]);

    const getStreak = useCallback(() => {
        return streakData.streak;
    }, [streakData]);

    const updateStreak = useCallback(async (allDailyComplete: boolean) => {
        if (!user) return;
        const today = getDateKey();
        if (allDailyComplete && streakData.lastFullCompletionDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = toLocalDateString(yesterday);
            const newStreak = streakData.lastFullCompletionDate === yesterdayKey ? streakData.streak + 1 : 1;

            const newData = { streak: newStreak, lastFullCompletionDate: today };
            setStreakData(newData);

            const streakRef = doc(db, 'users', user.uid, 'stats', 'streak');
            try { await setDoc(streakRef, newData); } catch (err) { console.warn('Firestore streak write error:', err); }
        }
    }, [user, streakData]);

    return { getStreak, updateStreak };
}
