import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toLocalDateString } from '@/lib/tasks';

/**
 * Seeds demo data for the current user into Firestore.
 * Populates: task completions (daily/weekly/monthly), streak, delegation events,
 * a reflection, and team members. Designed to make the dashboard look realistic.
 */
export async function seedDemoData(uid: string, userName: string) {
    const now = new Date();
    const today = toLocalDateString(now);

    // ── Period keys ────────────────────────────────────────
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekKey = `W-${toLocalDateString(monday)}`;
    const monthKey = `M-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Helper: random ISO timestamp from today between start/end hours
    const todayISO = (hour: number, minute = 0) => {
        const d = new Date(now);
        d.setHours(hour, minute, 0, 0);
        return d.toISOString();
    };

    // ── Daily completions (7 of 11 done, 2 delegated) ──────
    const dailyCompletions: Record<string, unknown> = {
        'daily-1': { taskId: 'daily-1', completedAt: todayISO(6, 45), notes: 'Quick walkthrough — register 2 was short $5', isDelegated: false, durationSeconds: 420 },
        'daily-2': { taskId: 'daily-2', completedAt: todayISO(7, 10), notes: '', isDelegated: false, durationSeconds: 300 },
        'daily-3': { taskId: 'daily-3', completedAt: todayISO(8, 0), notes: 'Assigned Sarah to jewelry, moved Mike to receiving', isDelegated: false, durationSeconds: 600 },
        'daily-4': { taskId: 'daily-4', completedAt: todayISO(9, 30), notes: '', isDelegated: true, delegatedTo: 'Sarah — Asst. Mgr', delegatedAt: todayISO(9, 15), followUpStatus: 'verified', verifiedAt: todayISO(10, 0) },
        'daily-5': { taskId: 'daily-5', completedAt: todayISO(10, 15), notes: 'Moved seasonal items to front endcap', isDelegated: false, durationSeconds: 900 },
        'daily-6': { taskId: 'daily-6', completedAt: todayISO(11, 30), notes: '', isDelegated: true, delegatedTo: 'Mike — Team Lead', delegatedAt: todayISO(11, 0), followUpStatus: 'pending' },
        'daily-7': { taskId: 'daily-7', completedAt: todayISO(12, 45), notes: 'All pricing up to date', isDelegated: false, durationSeconds: 480 },
    };

    // ── Weekly completions (4 of 9 done) ────────────────────
    const weeklyCompletions: Record<string, unknown> = {
        'weekly-1': { taskId: 'weekly-1', completedAt: todayISO(14, 0), notes: 'Updated schedule for next week — covered Sara PTO', isDelegated: false },
        'weekly-2': { taskId: 'weekly-2', completedAt: todayISO(15, 0), notes: '', isDelegated: false },
        'weekly-3': { taskId: 'weekly-3', completedAt: todayISO(10, 30), notes: 'Reorganized furniture section — better flow', isDelegated: false },
        'weekly-5': { taskId: 'weekly-5', completedAt: todayISO(13, 0), notes: 'Inventory levels look healthy, ordered more hangers', isDelegated: false },
    };

    // ── Monthly completions (3 of 8 done) ───────────────────
    const monthlyCompletions: Record<string, unknown> = {
        'monthly-1': { taskId: 'monthly-1', completedAt: todayISO(9, 0), notes: 'Revenue up 12% from last month', isDelegated: false },
        'monthly-2': { taskId: 'monthly-2', completedAt: todayISO(14, 0), notes: 'Sarah and Mike both hit performance goals', isDelegated: false },
        'monthly-4': { taskId: 'monthly-4', completedAt: todayISO(11, 0), notes: 'Emergency exits clear, fire extinguishers checked', isDelegated: false },
    };

    // ── Delegation events ───────────────────────────────────
    const delegationEvents = [
        { type: 'delegated', taskId: 'daily-4', delegatedTo: 'Sarah — Asst. Mgr', timestamp: todayISO(9, 15) },
        { type: 'verified', taskId: 'daily-4', delegatedTo: 'Sarah — Asst. Mgr', timestamp: todayISO(10, 0) },
        { type: 'delegated', taskId: 'daily-6', delegatedTo: 'Mike — Team Lead', timestamp: todayISO(11, 0) },
    ];

    // ── Yesterday's completions (for streak history) ────────
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toLocalDateString(yesterday);
    const yesterdayCompletions: Record<string, unknown> = {};
    for (let i = 1; i <= 11; i++) {
        yesterdayCompletions[`daily-${i}`] = {
            taskId: `daily-${i}`,
            completedAt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 6 + i, 0, 0).toISOString(),
            notes: '',
            isDelegated: false,
        };
    }

    // ── Streak ──────────────────────────────────────────────
    const streakData = {
        streak: 5,
        lastFullCompletionDate: yesterdayKey,
    };

    // ── Reflection (yesterday) ──────────────────────────────
    const reflection = {
        rating: 4,
        win: 'Hit daily sales target and trained new team member on register',
        challenge: 'Receiving was backed up — need to adjust schedule to have more hands in the morning',
        date: yesterdayKey,
        submittedAt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 30, 0).toISOString(),
    };

    // ── Team members ────────────────────────────────────────
    const teamMembers = {
        members: [
            { id: 'tm-1', name: 'Sarah Johnson', role: 'Assistant Manager', status: 'active' },
            { id: 'tm-2', name: 'Mike Torres', role: 'Team Lead', status: 'active' },
            { id: 'tm-3', name: 'Jessica Williams', role: 'Sales Associate', status: 'active' },
            { id: 'tm-4', name: 'David Chen', role: 'Receiving', status: 'active' },
            { id: 'tm-5', name: 'Amy Rodriguez', role: 'Cashier', status: 'active' },
        ],
    };

    // ── Write all data ──────────────────────────────────────
    const writes = [
        // Today's completions
        setDoc(doc(db, 'users', uid, 'taskCompletions', today), { completions: dailyCompletions }, { merge: true }),
        setDoc(doc(db, 'users', uid, 'taskCompletions', weekKey), { completions: weeklyCompletions }, { merge: true }),
        setDoc(doc(db, 'users', uid, 'taskCompletions', monthKey), { completions: monthlyCompletions }, { merge: true }),
        // Yesterday's completions (full day for streak)
        setDoc(doc(db, 'users', uid, 'taskCompletions', yesterdayKey), { completions: yesterdayCompletions }, { merge: true }),
        // Streak
        setDoc(doc(db, 'users', uid, 'stats', 'streak'), streakData),
        // Delegation events
        setDoc(doc(db, 'users', uid, 'delegationEvents', today), { events: delegationEvents }),
        // Reflection
        setDoc(doc(db, 'users', uid, 'reflections', yesterdayKey), reflection),
        // Team
        setDoc(doc(db, 'users', uid, 'team', 'members'), teamMembers),
    ];

    await Promise.all(writes);
    return {
        dailyDone: Object.keys(dailyCompletions).length,
        weeklyDone: Object.keys(weeklyCompletions).length,
        monthlyDone: Object.keys(monthlyCompletions).length,
        streak: streakData.streak,
        teamMembers: teamMembers.members.length,
    };
}
