'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AppShell from '@/components/layout/AppShell';
import { Check, ChevronDown, ChevronUp, Award, Pen } from 'lucide-react';
import { weeks } from '@/data/onboarding';

interface SignOff { trainerName: string; timestamp: string; }
interface TrainingState {
    completed: Record<string, boolean>;
    signOffs: Record<string, SignOff>;
    notes: Record<string, string>;
}

const emptyState: TrainingState = { completed: {}, signOffs: {}, notes: {} };

export default function TrainingPage() {
    const router = useRouter();
    const { isAuthenticated, user, loading } = useAuth();
    const [state, setState] = useState<TrainingState>(emptyState);
    const [activeWeek, setActiveWeek] = useState(0);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const [signOffModal, setSignOffModal] = useState<string | null>(null);
    const [trainerName, setTrainerName] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated) router.replace('/login');
    }, [loading, isAuthenticated, router]);

    // Listen to Firestore for training progress
    useEffect(() => {
        if (!user) return;
        const docRef = doc(db, 'users', user.uid, 'training', 'progress');
        const unsub = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setState(snap.data() as TrainingState);
            } else {
                setState(emptyState);
            }
        }, (err) => {
            console.warn('Firestore training listener error:', err.message);
        });
        return () => unsub();
    }, [user?.uid]);

    const saveState = async (newState: TrainingState) => {
        setState(newState);
        if (user) {
            const docRef = doc(db, 'users', user.uid, 'training', 'progress');
            await setDoc(docRef, newState);
        }
    };

    const toggleComplete = (id: string) => {
        saveState({ ...state, completed: { ...state.completed, [id]: !state.completed[id] } });
    };

    const submitSignOff = (taskId: string) => {
        if (!trainerName.trim()) return;
        saveState({
            ...state,
            signOffs: { ...state.signOffs, [taskId]: { trainerName: trainerName.trim(), timestamp: new Date().toISOString() } },
            completed: { ...state.completed, [taskId]: true },
        });
        setSignOffModal(null);
        setTrainerName('');
    };

    // Calculate total progress
    const allTasks = weeks.flatMap(w => w.days.flatMap(d => d.tasks));
    const completedCount = allTasks.filter(t => state.completed[t.id]).length;
    const totalTasks = allTasks.length;
    const progressPct = Math.round((completedCount / totalTasks) * 100);

    return (
        <AppShell>
            <div className="space-y-5 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-bold text-navy-dark">20-Day Training Plan</h1>
                    <p className="text-gray-400 text-sm mt-1">New GM Training & Certification Checklist</p>
                </div>

                {/* Overall Progress */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-navy-dark">Overall Progress</span>
                        <span className="text-sm font-bold text-navy-dark">{completedCount}/{totalTasks} tasks ({progressPct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-green transition-all duration-700" style={{ width: `${progressPct}%` }} />
                    </div>
                    {/* Day indicators */}
                    <div className="flex justify-between mt-3">
                        {Array.from({ length: 20 }, (_, i) => {
                            const dayTasks = weeks.flatMap(w => w.days).find(d => d.day === i + 1)?.tasks || [];
                            const dayDone = dayTasks.every(t => state.completed[t.id]);
                            const dayStarted = dayTasks.some(t => state.completed[t.id]);
                            return (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full text-[8px] flex items-center justify-center font-bold ${dayDone ? 'bg-green text-white' : dayStarted ? 'bg-yellow' : 'bg-gray-100'
                                        }`}
                                    title={`Day ${i + 1}`}
                                />
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-gray-300">
                        <span>Day 1</span><span>Day 5</span><span>Day 10</span><span>Day 15</span><span>Day 20</span>
                    </div>
                </div>

                {/* Week Tabs */}
                <div className="flex overflow-x-auto gap-2 no-scrollbar">
                    {weeks.map((w, i) => (
                        <button
                            key={i}
                            onClick={() => { setActiveWeek(i); setExpandedDay(null); }}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeWeek === i
                                ? 'bg-navy text-white'
                                : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            Week {w.week}
                        </button>
                    ))}
                </div>

                {/* Week Title */}
                <div className="card p-4 border-l-4 border-l-red-accent">
                    <h2 className="font-semibold text-navy-dark">Week {weeks[activeWeek].week} — {weeks[activeWeek].title}</h2>
                    <p className="text-xs text-gray-400 mt-1">Days {weeks[activeWeek].days[0].day}–{weeks[activeWeek].days[weeks[activeWeek].days.length - 1].day}</p>
                </div>

                {/* Days */}
                <div className="space-y-3">
                    {weeks[activeWeek].days.map(day => {
                        const dayCompleted = day.tasks.filter(t => state.completed[t.id]).length;
                        const dayTotal = day.tasks.length;
                        const isExpanded = expandedDay === day.day;

                        return (
                            <div key={day.day} className="card overflow-hidden">
                                <button
                                    onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                                    className="w-full flex items-center gap-3 px-4 py-4 text-left"
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${dayCompleted === dayTotal ? 'bg-green text-white' : 'bg-gray-100 text-navy-dark'
                                        }`}>
                                        {dayCompleted === dayTotal ? <Check size={18} /> : day.day}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-navy-dark text-[15px]">Day {day.day}: {day.title}</h3>
                                        <p className="text-xs text-gray-400">{dayCompleted}/{dayTotal} tasks</p>
                                    </div>
                                    {isExpanded ? <ChevronUp size={18} className="text-gray-300" /> : <ChevronDown size={18} className="text-gray-300" />}
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3 animate-fade-in">
                                        {day.tasks.map(task => (
                                            <div key={task.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl ${state.completed[task.id] ? 'bg-green-light/20' : 'bg-gray-50'}`}>
                                                <button
                                                    onClick={() => task.requiresSignOff && !state.signOffs[task.id] ? setSignOffModal(task.id) : toggleComplete(task.id)}
                                                    className={`task-checkbox mt-0.5 ${state.completed[task.id] ? 'checked' : ''}`}
                                                >
                                                    {state.completed[task.id] && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${state.completed[task.id] ? 'text-gray-400 line-through' : 'text-navy-dark'}`}>{task.title}</p>
                                                    {task.requiresSignOff && (
                                                        <div className="mt-1">
                                                            {state.signOffs[task.id] ? (
                                                                <span className="badge badge-green text-[10px]">
                                                                    <Pen size={10} /> Signed by {state.signOffs[task.id].trainerName} — {new Date(state.signOffs[task.id].timestamp).toLocaleDateString()}
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-yellow text-[10px]">
                                                                    <Award size={10} /> Requires sign-off
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Sign-off Modal */}
                {signOffModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => setSignOffModal(null)}>
                        <div className="card p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
                            <h3 className="font-bold text-navy-dark text-lg mb-1">Trainer Sign-Off</h3>
                            <p className="text-sm text-gray-400 mb-4">Enter the trainer&apos;s name to sign off on this task.</p>
                            <input
                                type="text"
                                value={trainerName}
                                onChange={e => setTrainerName(e.target.value)}
                                placeholder="Trainer's full name"
                                className="search-input mb-4"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setSignOffModal(null)} className="btn btn-outline flex-1">Cancel</button>
                                <button onClick={() => submitSignOff(signOffModal)} className="btn btn-primary flex-1">Sign Off</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
