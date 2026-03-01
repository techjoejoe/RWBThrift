import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dailyTasks, weeklyTasks, monthlyTasks } from '@/data/tasks';
import { toLocalDateString } from '@/lib/tasks';
import { TaskCompletion } from '@/lib/tasks';
import { SUPER_ADMIN_UID } from '@/lib/constants';

export interface GMData {
    uid: string;
    name: string;
    store: string;
    isOnboarding: boolean;
    onboardingDay?: number;
    daily: { completed: number; delegated: number; total: number };
    weekly: { completed: number; delegated: number; total: number };
    monthly: { completed: number; delegated: number; total: number };
    streak: number;
    delegates: string[];
}

/**
 * Loads completion data for all GMs visible to a DM.
 * Admins see all GMs; DMs see only GMs in their assigned district.
 */
export async function loadGMData(userUid: string): Promise<GMData[]> {
    // Determine which storeIds this DM should see
    let allowedStoreIds: string[] | null = null; // null = see all (admin)

    if (userUid !== SUPER_ADMIN_UID) {
        const districtsSnap = await getDocs(collection(db, 'districts'));
        let myDistrictId: string | null = null;
        districtsSnap.forEach(d => {
            const data = d.data();
            if (data.dmUid === userUid) {
                myDistrictId = d.id;
            }
        });

        if (myDistrictId) {
            const storesSnap = await getDocs(collection(db, 'stores'));
            allowedStoreIds = [];
            storesSnap.forEach(d => {
                const data = d.data();
                if (data.districtId === myDistrictId) {
                    allowedStoreIds!.push(d.id);
                }
            });
        } else {
            allowedStoreIds = []; // DM with no district sees no one
        }
    }

    // Get all users who are GMs
    const usersSnap = await getDocs(collection(db, 'users'));
    const gmUsers: { uid: string; name: string; store: string; isOnboarding: boolean; onboardingDay?: number }[] = [];
    usersSnap.forEach(d => {
        const data = d.data();
        if (data.role === 'gm' || data.role === 'trainer' || data.role === 'admin') {
            if (allowedStoreIds !== null && !allowedStoreIds.includes(data.storeId || '')) {
                return;
            }
            gmUsers.push({
                uid: d.id,
                name: data.name || 'Unknown',
                store: data.store || 'No Store',
                isOnboarding: data.isOnboarding || false,
                onboardingDay: data.onboardingDay,
            });
        }
    });

    const today = toLocalDateString();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekKey = `week-${toLocalDateString(monday)}`;
    const monthKey = `month-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const gmDataList: GMData[] = await Promise.all(gmUsers.map(async (gmUser) => {
        let dailyCompletions: Record<string, TaskCompletion> = {};
        let weeklyCompletions: Record<string, TaskCompletion> = {};
        let monthlyCompletions: Record<string, TaskCompletion> = {};
        let streak = 0;

        try {
            const dailySnap = await getDoc(doc(db, 'users', gmUser.uid, 'taskCompletions', today));
            if (dailySnap.exists()) dailyCompletions = dailySnap.data()?.completions || {};
        } catch { }

        try {
            const weeklySnap = await getDoc(doc(db, 'users', gmUser.uid, 'taskCompletions', weekKey));
            if (weeklySnap.exists()) weeklyCompletions = weeklySnap.data()?.completions || {};
        } catch { }

        try {
            const monthlySnap = await getDoc(doc(db, 'users', gmUser.uid, 'taskCompletions', monthKey));
            if (monthlySnap.exists()) monthlyCompletions = monthlySnap.data()?.completions || {};
        } catch { }

        try {
            const streakSnap = await getDoc(doc(db, 'users', gmUser.uid, 'stats', 'streak'));
            if (streakSnap.exists()) streak = streakSnap.data()?.streak || 0;
        } catch { }

        const dailyDone = dailyTasks.filter(t => dailyCompletions[t.id]?.completedAt).length;
        const dailyDel = dailyTasks.filter(t => dailyCompletions[t.id]?.isDelegated).length;
        const weeklyDone = weeklyTasks.filter(t => weeklyCompletions[t.id]?.completedAt).length;
        const weeklyDel = weeklyTasks.filter(t => weeklyCompletions[t.id]?.isDelegated).length;
        const monthlyDone = monthlyTasks.filter(t => monthlyCompletions[t.id]?.completedAt).length;
        const monthlyDel = monthlyTasks.filter(t => monthlyCompletions[t.id]?.isDelegated).length;

        const delegates = new Set<string>();
        Object.values(dailyCompletions).forEach((c) => { if (c?.delegatedTo) delegates.add(c.delegatedTo); });

        return {
            uid: gmUser.uid, name: gmUser.name, store: gmUser.store,
            isOnboarding: gmUser.isOnboarding, onboardingDay: gmUser.onboardingDay,
            daily: { completed: dailyDone, delegated: dailyDel, total: dailyTasks.length },
            weekly: { completed: weeklyDone, delegated: weeklyDel, total: weeklyTasks.length },
            monthly: { completed: monthlyDone, delegated: monthlyDel, total: monthlyTasks.length },
            streak, delegates: [...delegates],
        };
    }));

    // Sort by daily completion percentage (highest first)
    gmDataList.sort((a, b) => {
        const aPct = a.daily.total > 0 ? a.daily.completed / a.daily.total : 0;
        const bPct = b.daily.total > 0 ? b.daily.completed / b.daily.total : 0;
        return bPct - aPct;
    });

    return gmDataList;
}
