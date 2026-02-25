'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTasks } from '@/lib/tasks';
import { dailyTasks, weeklyTasks, monthlyTasks, TimeWindow } from '@/data/tasks';
import { getCurrentTimeWindow, getTimeWindowLabel } from '@/lib/timeWindows';
import { toLocalDateString } from '@/lib/tasks';
import { MiniBar } from '@/components/ui/ProgressRing';
import ProgressCard from '@/components/ui/ProgressCard';
import DelegationSection from '@/components/dashboard/DelegationSection';
import StreakSection from '@/components/dashboard/StreakSection';
import PerformanceMetrics from '@/components/dashboard/PerformanceMetrics';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AppShell from '@/components/layout/AppShell';
import { Confetti, StreakToast, ReflectionModal } from '@/components/Celebrations';
import DistrictPulse, { useDistrictSync } from '@/components/DistrictPulse';
import { DashboardSkeleton } from '@/components/Skeletons';
import {
    Flame, CheckCircle2, AlertTriangle, ArrowRight, CalendarDays,
    Clock, TrendingUp, ExternalLink, Sparkles, Target, Camera,
    Users2, Trophy, Zap, Timer, BarChart3, Award,
} from 'lucide-react';
import Link from 'next/link';

const quotes = [
    '"Getting work done through others — that\'s leadership."',
    '"Inspect what you expect."',
    '"Standards don\'t slip — people let them."',
    '"What gets measured gets managed."',
    '"Consistency beats intensity every time."',
    '"A good GM multiplies their impact through their team."',
    '"Walk the floor before you check the reports."',
];

const quickLinks = [
    { label: 'Dayforce', url: 'https://www.dayforcehcm.com/', icon: <Clock size={16} /> },
    { label: 'Power BI', url: 'https://app.powerbi.com', icon: <TrendingUp size={16} /> },
    { label: 'Outlook', url: 'https://outlook.office.com/mail/', icon: <CalendarDays size={16} /> },
    { label: 'Teams', url: 'https://teams.microsoft.com/v2/', icon: <ExternalLink size={16} /> },
];

const DELEGATION_DAILY_TARGET = 3;

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();
    const {
        isCompleted, getCompletionCount, getDelegatedCount, getPendingFollowUpCount,
        getAllCompletions, getStreak, updateStreak, delegationEvents,
    } = useTasks();
    const [showConfetti, setShowConfetti] = useState(false);
    const [streakToast, setStreakToast] = useState<number | null>(null);
    const [showReflection, setShowReflection] = useState(false);
    const [reflectionDone, setReflectionDone] = useState(false);

    useDistrictSync();

    useEffect(() => {
        if (!isAuthenticated) router.replace('/login');
    }, [isAuthenticated, router]);

    // Check if reflection should show (after 4pm, not yet done today)
    useEffect(() => {
        if (!user) return;
        const hour = new Date().getHours();
        if (hour < 16) return;
        const today = toLocalDateString();
        const checkReflection = async () => {
            try {
                const ref = doc(db, 'users', user.uid, 'reflections', today);
                const snap = await getDoc(ref);
                if (!snap.exists()) {
                    setTimeout(() => setShowReflection(true), 2000);
                } else {
                    setReflectionDone(true);
                }
            } catch { /* Firestore rules may block */ }
        };
        checkReflection();
    }, [user]);

    const handleReflectionSubmit = useCallback(async (data: { rating: number; win: string; challenge: string }) => {
        if (!user) return;
        const today = toLocalDateString();
        try {
            await setDoc(doc(db, 'users', user.uid, 'reflections', today), {
                ...data, date: today, submittedAt: new Date().toISOString(),
            });
        } catch (err) { console.warn('Reflection save failed:', err); }
        setShowReflection(false);
        setReflectionDone(true);
    }, [user]);

    if (loading || !user || !user.name) return null;

    const dailyCompleted = getCompletionCount(dailyTasks.map(t => t.id), 'daily');
    const weeklyCompleted = getCompletionCount(weeklyTasks.map(t => t.id), 'weekly');
    const monthlyCompleted = getCompletionCount(monthlyTasks.map(t => t.id), 'monthly');
    const streak = getStreak();

    if (dailyCompleted === dailyTasks.length) updateStreak(true);

    const today = new Date();
    const hour = today.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const quoteOfDay = quotes[today.getDate() % quotes.length];
    const firstName = (user.name || 'GM').split(' ')[0];
    const overdueDailyCount = dailyTasks.length - dailyCompleted;

    const currentWindow = getCurrentTimeWindow();
    const windowOrder: TimeWindow[] = ['morning', 'midday', 'afternoon', 'close'];
    const currentIdx = windowOrder.indexOf(currentWindow);

    const sortedDailyTasks = [...dailyTasks].sort((a, b) => {
        const aIdx = windowOrder.indexOf(a.timeWindow || 'morning');
        const bIdx = windowOrder.indexOf(b.timeWindow || 'morning');
        return aIdx - bIdx;
    });
    const nextTask = sortedDailyTasks.find(t => !isCompleted(t.id, 'daily'));

    const dailyColor = dailyCompleted === dailyTasks.length ? 'var(--green)' : dailyCompleted > dailyTasks.length / 2 ? 'var(--yellow)' : 'var(--red-accent)';
    const weeklyColor = weeklyCompleted === weeklyTasks.length ? 'var(--green)' : weeklyCompleted > weeklyTasks.length / 2 ? 'var(--yellow)' : 'var(--red-accent)';
    const monthlyColor = monthlyCompleted === monthlyTasks.length ? 'var(--green)' : monthlyCompleted > monthlyTasks.length / 2 ? 'var(--yellow)' : 'var(--red-accent)';

    // Time window stats
    const timeWindowStats = useMemo(() => {
        return windowOrder.map(tw => {
            const tasksInWindow = dailyTasks.filter(t => t.timeWindow === tw);
            const completedCount = tasksInWindow.filter(t => isCompleted(t.id, 'daily')).length;
            const isPast = windowOrder.indexOf(tw) < currentIdx;
            const isCurrent = tw === currentWindow;
            return { window: tw, label: getTimeWindowLabel(tw), total: tasksInWindow.length, completed: completedCount, isPast, isCurrent };
        });
    }, [isCompleted, currentWindow, currentIdx]);

    // Overdue tasks
    const overdueByWindow = useMemo(() => {
        return dailyTasks.filter(t => {
            const twIdx = windowOrder.indexOf(t.timeWindow || 'morning');
            return twIdx < currentIdx && !isCompleted(t.id, 'daily');
        });
    }, [isCompleted, currentIdx]);

    // Delegation metrics
    const dailyDelegated = getDelegatedCount(dailyTasks.map(t => t.id), 'daily');
    const dailyPending = getPendingFollowUpCount(dailyTasks.map(t => t.id), 'daily');
    const delegatedToday = delegationEvents.filter(e => e.type === 'delegated').length;
    const verifiedToday = delegationEvents.filter(e => e.type === 'verified').length;
    const cancelledToday = delegationEvents.filter(e => e.type === 'cancelled').length;
    const delegationSuccessRate = delegatedToday > 0 ? Math.round((verifiedToday / delegatedToday) * 100) : null;

    // Efficiency metrics
    const allDailyCompletions = getAllCompletions('daily');
    const completionTimes = Object.values(allDailyCompletions)
        .filter(c => c.completedAt)
        .map(c => new Date(c.completedAt).getTime())
        .sort((a, b) => a - b);

    const firstTaskTime = completionTimes.length > 0
        ? new Date(completionTimes[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;
    const hoursElapsed = Math.max(1, (Date.now() - (completionTimes[0] || Date.now())) / (1000 * 60 * 60));
    const tasksPerHour = completionTimes.length > 0 ? (dailyCompleted / hoursElapsed).toFixed(1) : null;

    const totalDone = dailyCompleted + weeklyCompleted + monthlyCompleted;
    const totalTasks = dailyTasks.length + weeklyTasks.length + monthlyTasks.length;
    const consistencyScore = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

    // Delegation behavior
    const selfCompletedToday = dailyCompleted - verifiedToday;
    const delegationRate = (dailyCompleted + delegatedToday) > 0
        ? Math.round((delegatedToday / (dailyCompleted + delegatedToday)) * 100)
        : 0;
    const showAntiPattern = selfCompletedToday >= 5 && delegatedToday === 0;

    const delegatedTaskIds = delegationEvents.filter(e => e.type === 'delegated').map(e => e.taskId);
    const timeSaved = dailyTasks
        .filter(t => delegatedTaskIds.includes(t.id))
        .reduce((sum, t) => sum + (t.estimatedMinutes || 10), 0);

    const uniqueDelegates = useMemo(() => {
        const names = new Set<string>();
        delegationEvents.forEach(e => names.add(e.delegatedTo));
        return names.size;
    }, [delegationEvents]);

    const delegationBadges = [
        { id: 'team-builder', label: 'Team Builder', desc: 'Delegate 10+ tasks', earned: delegatedToday >= 10 || verifiedToday >= 5, icon: '👷' },
        { id: 'trust-leader', label: 'Trust Leader', desc: '5 verified delegations', earned: verifiedToday >= 5, icon: '🤝' },
        { id: 'bench-builder', label: 'Bench Builder', desc: 'Delegate to 3+ people', earned: uniqueDelegates >= 3, icon: '🪑' },
    ];

    return (
        <AppShell>
            <Confetti trigger={showConfetti} />
            {streakToast && <StreakToast count={streakToast} onDismiss={() => setStreakToast(null)} />}
            {showReflection && (
                <ReflectionModal onSubmit={handleReflectionSubmit} onClose={() => setShowReflection(false)} />
            )}

            <div className="space-y-5 animate-slide-up">
                {/* Greeting + Streak Hero */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-navy-dark">{greeting}, {firstName}!</h1>
                        <p className="text-gray-400 text-sm mt-1">{dateStr}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1" title={`Streak: ${streak} consecutive days with all daily tasks completed.`}>
                        <div className={`relative ${streak > 0 ? 'flame-pulse' : ''}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${streak > 0
                                ? 'bg-gradient-to-br from-yellow/20 to-orange-200/30 border border-yellow/30'
                                : 'bg-gray-50 border border-gray-100'}`}>
                                <Flame size={24} className={streak > 0 ? 'text-yellow' : 'text-gray-300'} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-navy-dark text-white text-[11px] font-bold flex items-center justify-center">
                                {streak}
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400">
                            {streak > 0 ? 'Day Streak' : 'No Streak'}
                        </span>
                    </div>
                </div>

                {/* Streak Message */}
                {streak > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow/20 bg-gradient-to-r from-yellow-light/20 to-orange-100/20">
                        <span className="text-lg">🔥</span>
                        <p className="text-sm font-medium text-navy-dark">
                            {streak >= 7
                                ? `Incredible! ${streak}-day streak. You're building a habit.`
                                : streak >= 3
                                    ? `${streak}-day streak! Don't break it — complete all tasks today.`
                                    : `${streak}-day streak started! Keep it going.`}
                        </p>
                    </div>
                )}

                <DistrictPulse />

                {/* Next Action */}
                {nextTask && (
                    <Link href="/tasks" className="block">
                        <div className="card p-5 border-l-4 border-l-red-accent card-interactive group">
                            <div className="flex items-center gap-2 mb-2">
                                <Target size={14} className="text-red-accent" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-red-accent">Next Action</span>
                                <span className={`time-badge ${nextTask.timeWindow === currentWindow ? 'time-badge-now' : 'time-badge-upcoming'}`}>
                                    {getTimeWindowLabel(nextTask.timeWindow || 'morning')}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-navy-dark group-hover:text-red-accent transition-colors">{nextTask.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{nextTask.description}</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-gray-300">{dailyCompleted}/{dailyTasks.length} daily tasks done</span>
                                <ArrowRight size={16} className="text-gray-300 group-hover:text-red-accent group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </Link>
                )}

                {/* Overdue Alert */}
                {overdueByWindow.length > 0 && (
                    <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-red-accent/20 bg-red-alert-light">
                        <AlertTriangle size={18} className="text-red-accent flex-shrink-0" />
                        <span className="text-sm font-medium text-red-accent">
                            {overdueByWindow.length} task{overdueByWindow.length > 1 ? 's' : ''} overdue from earlier time windows
                        </span>
                    </div>
                )}

                {/* Onboarding Banner */}
                {user.isOnboarding && (
                    <Link href="/training" className="block card p-5 border-l-4 border-l-blue-info card-interactive">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-navy-dark">📚 Onboarding — Day {user.onboardingDay || 1} of 20</p>
                                <p className="text-xs text-gray-400 mt-1">Week {Math.ceil((user.onboardingDay || 1) / 5)} • Continue your training</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-blue-info transition-all duration-500" style={{ width: `${((user.onboardingDay || 1) / 20) * 100}%` }} />
                                </div>
                                <ArrowRight size={18} className="text-gray-300" />
                            </div>
                        </div>
                    </Link>
                )}

                {/* Progress Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <ProgressCard title="Daily Tasks" completed={dailyCompleted} total={dailyTasks.length} period="today" color={dailyColor} tooltip="Tasks that reset every day." />
                    <ProgressCard title="Weekly Tasks" completed={weeklyCompleted} total={weeklyTasks.length} period="this week" color={weeklyColor} tooltip="Tasks done once per week." />
                    <ProgressCard title="Monthly Tasks" completed={monthlyCompleted} total={monthlyTasks.length} period="this month" color={monthlyColor} tooltip="Tasks done once per month." />
                </div>

                {/* Overall Grade */}
                {(() => {
                    const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;
                    const grade = overallPct >= 90 ? 'A' : overallPct >= 80 ? 'B' : overallPct >= 70 ? 'C' : overallPct >= 60 ? 'D' : 'F';
                    const gradeColor = overallPct >= 90 ? 'text-green' : overallPct >= 80 ? 'text-blue-info' : overallPct >= 70 ? 'text-yellow' : 'text-red-accent';
                    const gradeMsg = overallPct >= 90 ? 'Outstanding!' : overallPct >= 80 ? 'Great work — push for that A!' : overallPct >= 70 ? 'Solid effort. Delegate more.' : 'Room to improve.';
                    return (
                        <div className="card px-5 py-4 flex items-center gap-4">
                            <div className={`text-3xl font-black ${gradeColor}`}>{grade}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-navy-dark text-[15px]">Overall Grade</p>
                                <p className="text-xs text-gray-400">{totalDone}/{totalTasks} tasks · {overallPct}% — {gradeMsg}</p>
                            </div>
                        </div>
                    );
                })()}

                <PerformanceMetrics
                    timeWindowStats={timeWindowStats}
                    firstTaskTime={firstTaskTime}
                    tasksPerHour={tasksPerHour}
                    consistencyScore={consistencyScore}
                    totalDone={totalDone}
                    totalTasks={totalTasks}
                />

                <DelegationSection
                    dailyDelegated={dailyDelegated}
                    dailyPending={dailyPending}
                    delegatedToday={delegatedToday}
                    verifiedToday={verifiedToday}
                    cancelledToday={cancelledToday}
                    delegationSuccessRate={delegationSuccessRate}
                    uniqueDelegates={uniqueDelegates}
                    delegationRate={delegationRate}
                    timeSaved={timeSaved}
                    selfCompletedToday={selfCompletedToday}
                    showAntiPattern={showAntiPattern}
                    DELEGATION_DAILY_TARGET={DELEGATION_DAILY_TARGET}
                    delegationBadges={delegationBadges}
                />

                <StreakSection
                    streak={streak}
                    dailyCompleted={dailyCompleted}
                    dailyTotal={dailyTasks.length}
                />

                {/* Photo Prompt */}
                {!user.photoURL && (
                    <Link href="/profile" className="block card card-interactive p-4 border-l-4 border-l-blue-info">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-info-light/30 flex items-center justify-center">
                                <Camera size={18} className="text-blue-info" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-navy-dark">Add your profile photo</p>
                                <p className="text-xs text-gray-400">Your photo shows on the District Pulse leaderboard</p>
                            </div>
                            <ArrowRight size={16} className="text-gray-300" />
                        </div>
                    </Link>
                )}

                {/* All Tasks Done */}
                {dailyCompleted === dailyTasks.length && (
                    <div className="card p-6 text-center border border-green/20 bg-green-light/20 animate-scale-in">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-green" />
                        <h3 className="text-lg font-bold text-navy-dark">All Daily Tasks Complete! 🎉</h3>
                        <p className="text-gray-400 text-sm mt-1">Great work today. Keep the momentum going!</p>
                    </div>
                )}

                {/* Reflection */}
                {!reflectionDone && hour >= 16 && !showReflection && (
                    <button onClick={() => setShowReflection(true)} className="w-full card card-interactive p-5 text-left">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🌅</span>
                            <div>
                                <p className="text-sm font-semibold text-navy-dark">End-of-Day Reflection</p>
                                <p className="text-xs text-gray-400">Take 30 seconds to rate your day and capture one win</p>
                            </div>
                            <ArrowRight size={18} className="text-gray-300 ml-auto" />
                        </div>
                    </button>
                )}

                {reflectionDone && (
                    <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-green-light/20 border border-green/20">
                        <CheckCircle2 size={16} className="text-green" />
                        <span className="text-sm text-navy-dark font-medium">Today&apos;s reflection saved ✓</span>
                    </div>
                )}

                {/* Quick Links */}
                <div>
                    <h2 className="text-lg font-semibold text-navy-dark mb-3">Quick Links</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickLinks.map(link => (
                            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                                className="card card-interactive flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-navy-dark hover:text-red-accent transition-colors">
                                <div className="text-gray-300">{link.icon}</div>
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
