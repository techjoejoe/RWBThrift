'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTasks } from '@/lib/tasks';
import { dailyTasks, weeklyTasks, monthlyTasks, TaskDefinition, TimeWindow } from '@/data/tasks';
import { getCurrentTimeWindow, getTimeWindowLabel } from '@/lib/timeWindows';
import AppShell from '@/components/layout/AppShell';
import { Confetti, StreakToast } from '@/components/Celebrations';
import TaskItem from '@/components/TaskItem';
import { Target, Plus, Trash2, Check, X, Users2 } from 'lucide-react';

type TabType = 'daily' | 'weekly' | 'monthly';



export default function TasksPage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();
    const { isCompleted, toggleTask, delegateTask, undelegateTask, verifyDelegation, getCompletionCount, getDelegatedCount, getPendingFollowUpCount, getCompletion, updateNotes, getStreak, updateStreak } = useTasks();
    const [tab, setTab] = useState<TabType>('daily');
    const [showConfetti, setShowConfetti] = useState(false);
    const [streakToast, setStreakToast] = useState<number | null>(null);
    const prevCompleted = useRef(0);
    const [customTasks, setCustomTasks] = useState<{ id: string; title: string; done: boolean }[]>([]);
    const [showAddCustom, setShowAddCustom] = useState(false);
    const [customTitle, setCustomTitle] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated) router.replace('/login');
    }, [loading, isAuthenticated, router]);

    const currentWindow = getCurrentTimeWindow();
    const windowOrder: TimeWindow[] = ['morning', 'midday', 'afternoon', 'close'];
    const currentIdx = windowOrder.indexOf(currentWindow);

    const taskSets: Record<TabType, { tasks: TaskDefinition[]; label: string }> = {
        daily: {
            tasks: [...dailyTasks].sort((a, b) => {
                // Completed tasks go to bottom
                const aCompleted = isCompleted(a.id, 'daily');
                const bCompleted = isCompleted(b.id, 'daily');
                if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
                // Then sort by time window: morning → midday → afternoon → close
                const aIdx = windowOrder.indexOf(a.timeWindow || 'morning');
                const bIdx = windowOrder.indexOf(b.timeWindow || 'morning');
                return aIdx - bIdx;
            }),
            label: 'Daily Tasks',
        },
        weekly: { tasks: weeklyTasks, label: 'Weekly Tasks' },
        monthly: { tasks: monthlyTasks, label: 'Monthly Tasks' },
    };

    const current = taskSets[tab];
    const taskIds = tab === 'daily' ? dailyTasks.map(t => t.id) : current.tasks.map(t => t.id);
    const completed = getCompletionCount(taskIds, tab);
    const delegated = getDelegatedCount(taskIds, tab);
    const total = current.tasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Passive timing: track when last action happened
    const lastActionRef = useRef<number>(Date.now());
    // Reset when tab changes or page loads
    useEffect(() => { lastActionRef.current = Date.now(); }, [tab]);

    // Celebration on task completion
    const handleToggle = useCallback((taskId: string) => {
        const wasCompleted = isCompleted(taskId, tab);

        if (!wasCompleted) {
            // Calculate passive duration
            const now = Date.now();
            const elapsed = Math.round((now - lastActionRef.current) / 1000);
            // Cap at 30 minutes to avoid inflated data from idle
            const duration = elapsed > 0 && elapsed <= 1800 ? elapsed : undefined;
            lastActionRef.current = now;

            toggleTask(taskId, tab, duration);

            // Check if this completes all tasks
            const newCompleted = completed + 1;
            if (newCompleted === total && tab === 'daily') {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 100);
            }

            // Consecutive task completion toast
            if (newCompleted >= 3 && newCompleted % 3 === 0) {
                setStreakToast(newCompleted);
            }
        } else {
            toggleTask(taskId, tab);
        }
    }, [isCompleted, toggleTask, tab, completed, total]);

    return (
        <AppShell>
            <Confetti trigger={showConfetti} />
            {streakToast && <StreakToast count={streakToast} onDismiss={() => setStreakToast(null)} />}

            <div className="space-y-5 animate-slide-up">
                <h1 className="text-2xl font-bold text-navy-dark">Task Routines</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {(['daily', 'weekly', 'monthly'] as TabType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-3 text-sm font-medium capitalize transition-all ${tab === t ? 'tab-active' : 'tab-inactive'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Progress Header */}
                <div className="card p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <h2 className="font-semibold text-navy-dark text-[15px]">{current.label}</h2>
                            <p className="text-sm text-gray-400">
                                {completed} of {total} complete
                                {delegated > 0 && <span className="text-blue-info ml-1">· {delegated} delegated</span>}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${percent}%`,
                                        background: percent === 100 ? 'var(--green)' : percent >= 50 ? 'var(--yellow)' : 'var(--red-accent)',
                                    }}
                                />
                            </div>
                            <span className="text-sm font-bold text-navy-dark min-w-[36px] text-right">{percent}%</span>
                        </div>
                    </div>
                    {/* Time window indicator for daily */}
                    {tab === 'daily' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                            <Target size={12} className="text-red-accent" />
                            <span>Current focus: <strong className="text-navy-dark">{getTimeWindowLabel(currentWindow)}</strong> tasks</span>
                        </div>
                    )}
                    {delegated > 0 && (() => {
                        const pending = getPendingFollowUpCount(taskIds, tab);
                        return (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                                <Users2 size={14} className="text-navy" />
                                <span>{delegated} delegated</span>
                                {pending > 0 && (
                                    <span className="badge badge-yellow text-[10px]">
                                        {pending} awaiting follow-up
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Task List */}
                <div className="space-y-3">
                    {current.tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            category={tab}
                            isCompleted={isCompleted(task.id, tab)}
                            onToggle={() => handleToggle(task.id)}
                            completion={getCompletion(task.id, tab)}
                            onUpdateNotes={(n) => updateNotes(task.id, tab, n)}
                            onDelegate={(name) => delegateTask(task.id, tab, name)}
                            onUndelegate={() => undelegateTask(task.id, tab)}
                            onVerify={() => verifyDelegation(task.id, tab)}
                            isCurrentWindow={task.timeWindow === currentWindow}
                        />
                    ))}
                </div>

                {/* Custom Tasks */}
                {customTasks.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Custom Tasks</p>
                        {customTasks.map(ct => (
                            <div key={ct.id} className={`card px-4 py-3 flex items-center gap-3 ${ct.done ? 'opacity-60' : ''}`}>
                                <button onClick={() => setCustomTasks(prev => prev.map(t => t.id === ct.id ? { ...t, done: !t.done } : t))} className={`task-checkbox ${ct.done ? 'checked' : ''}`}>
                                    {ct.done && <Check size={14} className="text-white" strokeWidth={3} />}
                                </button>
                                <span className={`flex-1 text-sm ${ct.done ? 'text-gray-400 line-through' : 'text-navy-dark'}`}>{ct.title}</span>
                                <button onClick={() => setCustomTasks(prev => prev.filter(t => t.id !== ct.id))} className="text-gray-300 hover:text-red-accent"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Custom Task */}
                {showAddCustom ? (
                    <div className="card p-4 flex gap-2 animate-fade-in">
                        <input value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="What needs to get done?" className="search-input flex-1" style={{ paddingLeft: 12 }} onKeyDown={e => { if (e.key === 'Enter' && customTitle.trim()) { setCustomTasks(prev => [...prev, { id: Date.now().toString(), title: customTitle.trim(), done: false }]); setCustomTitle(''); } }} />
                        <button onClick={() => { if (customTitle.trim()) { setCustomTasks(prev => [...prev, { id: Date.now().toString(), title: customTitle.trim(), done: false }]); setCustomTitle(''); } }} className="btn btn-primary text-sm py-2 px-3">Add</button>
                        <button onClick={() => { setShowAddCustom(false); setCustomTitle(''); }} className="btn btn-outline text-sm py-2 px-3"><X size={14} /></button>
                    </div>
                ) : (
                    <button onClick={() => setShowAddCustom(true)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-navy hover:border-navy transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} /> Add Custom Task
                    </button>
                )}

                {/* All Done Message */}
                {completed === total && (
                    <div className="card p-6 text-center border border-green/20 bg-green-light/20 animate-scale-in">
                        <span className="text-3xl">🎉</span>
                        <h3 className="text-lg font-bold text-navy-dark mt-2">All {tab} tasks complete!</h3>
                        <p className="text-gray-400 text-sm mt-1">Outstanding work. Keep leading the business!</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
