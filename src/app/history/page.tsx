'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { dailyTasks, weeklyTasks, monthlyTasks } from '@/data/tasks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AppShell from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/Skeletons';
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Users2, Clock, TrendingUp } from 'lucide-react';
import { getDateKey, getWeekKey, getMonthKey, TaskCompletion, toLocalDateString } from '@/lib/tasks';

interface ReflectionData {
    rating: number;
    win?: string;
    challenge?: string;
    date: string;
    submittedAt: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dayData, setDayData] = useState<Record<string, TaskCompletion> | null>(null);
    const [reflectionData, setReflectionData] = useState<ReflectionData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (!authLoading && !isAuthenticated) router.replace('/login'); }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!user) return;
        const loadDay = async () => {
            setLoading(true);
            const dateStr = toLocalDateString(selectedDate);
            try {
                // Load daily completions
                const dailyRef = doc(db, 'users', user.uid, 'tasks', dateStr);
                const dailySnap = await getDoc(dailyRef);
                setDayData(dailySnap.exists() ? dailySnap.data()?.completions || {} : {});

                // Load reflection
                const reflRef = doc(db, 'users', user.uid, 'reflections', dateStr);
                const reflSnap = await getDoc(reflRef);
                setReflectionData(reflSnap.exists() ? reflSnap.data() as ReflectionData : null);
            } catch { setDayData({}); setReflectionData(null); }
            setLoading(false);
        };
        loadDay();
    }, [user, selectedDate]);

    if (authLoading || !user) return null;

    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const dateLabel = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const completions = dayData || {};
    const dailyDone = dailyTasks.filter(t => completions[t.id]?.completedAt).length;
    const delegated = dailyTasks.filter(t => completions[t.id]?.isDelegated).length;
    const verified = dailyTasks.filter(t => completions[t.id]?.followUpStatus === 'verified').length;
    const pct = dailyTasks.length > 0 ? Math.round((dailyDone / dailyTasks.length) * 100) : 0;

    const navigate = (days: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        if (d <= new Date()) setSelectedDate(d);
    };

    return (
        <AppShell>
            <div className="space-y-5 animate-slide-up">
                <h1 className="text-2xl font-bold text-navy-dark">📅 Performance History</h1>

                {/* Date Picker */}
                <div className="card p-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={20} className="text-gray-400" />
                    </button>
                    <div className="text-center">
                        <p className="text-lg font-bold text-navy-dark">{dateLabel}</p>
                        {isToday && <span className="text-xs text-green font-medium">Today</span>}
                    </div>
                    <button onClick={() => navigate(1)} disabled={isToday} className={`p-2 rounded-lg hover:bg-gray-50 transition-colors ${isToday ? 'opacity-30' : ''}`}>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>
                </div>

                {loading ? (
                    <div className="card p-8 text-center text-gray-400">Loading...</div>
                ) : (
                    <>
                        {/* Completion Overview */}
                        <div className="grid grid-cols-4 gap-3">
                            <div className="card p-4 text-center" title="Daily tasks completed that day">
                                <CheckCircle2 size={18} className={`mx-auto mb-1 ${pct === 100 ? 'text-green' : 'text-gray-300'}`} />
                                <p className="text-xl font-bold text-navy-dark">{dailyDone}/{dailyTasks.length}</p>
                                <p className="text-[10px] text-gray-400">Completed</p>
                            </div>
                            <div className="card p-4 text-center" title="Completion percentage">
                                <TrendingUp size={18} className={`mx-auto mb-1 ${pct >= 80 ? 'text-green' : pct >= 50 ? 'text-yellow' : 'text-red-accent'}`} />
                                <p className="text-xl font-bold text-navy-dark">{pct}%</p>
                                <p className="text-[10px] text-gray-400">Score</p>
                            </div>
                            <div className="card p-4 text-center" title="Tasks delegated to team members">
                                <Users2 size={18} className={`mx-auto mb-1 ${delegated > 0 ? 'text-blue-info' : 'text-gray-300'}`} />
                                <p className="text-xl font-bold text-navy-dark">{delegated}</p>
                                <p className="text-[10px] text-gray-400">Delegated</p>
                            </div>
                            <div className="card p-4 text-center" title="Delegated tasks verified as completed">
                                <Clock size={18} className={`mx-auto mb-1 ${verified > 0 ? 'text-green' : 'text-gray-300'}`} />
                                <p className="text-xl font-bold text-navy-dark">{verified}</p>
                                <p className="text-[10px] text-gray-400">Verified</p>
                            </div>
                        </div>

                        {/* Task List Snapshot */}
                        <div className="card p-5">
                            <h3 className="font-semibold text-navy-dark mb-3">Daily Tasks</h3>
                            <div className="space-y-2">
                                {dailyTasks.map(task => {
                                    const c = completions[task.id];
                                    const done = !!c?.completedAt;
                                    const del = c?.isDelegated;
                                    return (
                                        <div key={task.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                            {done ? (
                                                <CheckCircle2 size={16} className="text-green flex-shrink-0" />
                                            ) : (
                                                <XCircle size={16} className="text-gray-300 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${done ? 'text-gray-400' : 'text-navy-dark'} ${done ? 'line-through' : ''}`}>
                                                    {task.title}
                                                </p>
                                            </div>
                                            {del && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-info-light text-blue-info font-medium">
                                                    → {c.delegatedTo}
                                                </span>
                                            )}
                                            {done && c?.completedAt && (
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(c.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reflection */}
                        {reflectionData && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-navy-dark mb-3">🌅 End-of-Day Reflection</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Day Rating:</span>
                                        <span className="text-lg">{['😞', '😐', '🙂', '😊', '🤩'][reflectionData.rating - 1]}</span>
                                    </div>
                                    {reflectionData.win && (
                                        <div>
                                            <span className="text-xs text-gray-400 font-medium">Win:</span>
                                            <p className="text-sm text-navy-dark">{reflectionData.win}</p>
                                        </div>
                                    )}
                                    {reflectionData.challenge && (
                                        <div>
                                            <span className="text-xs text-gray-400 font-medium">Challenge:</span>
                                            <p className="text-sm text-navy-dark">{reflectionData.challenge}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {dailyDone === 0 && !reflectionData && (
                            <div className="card p-8 text-center">
                                <CalendarDays size={32} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-400 text-sm">No data recorded for this date</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppShell>
    );
}
