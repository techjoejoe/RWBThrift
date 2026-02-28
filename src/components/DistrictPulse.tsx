'use client';

import React, { useEffect, useState, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { useTasks, toLocalDateString } from '@/lib/tasks';
import { dailyTasks } from '@/data/tasks';
import { Trophy, Flame, Crown, Users, TrendingUp } from 'lucide-react';

export interface GMSummary {
    uid: string;
    name: string;
    store: string;
    photoURL?: string;
    dailyCompleted: number;
    dailyTotal: number;
    streak: number;
    completedAllAt?: string; // timestamp when they hit 100%
    updatedAt: string;
}

function ProgressRing({ percent, size = 48, strokeWidth = 3, photoURL, name, isFirst }: {
    percent: number; size?: number; strokeWidth?: number; photoURL?: string; name: string; isFirst?: boolean;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const color = percent === 100 ? 'var(--green)' : percent >= 50 ? 'var(--yellow)' : 'var(--red-accent)';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 absolute inset-0">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--gray-100)" strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </svg>
            {/* Avatar inside ring */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ padding: strokeWidth + 2 }}>
                {photoURL ? (
                    <img src={photoURL} alt={name} className="w-full h-full rounded-full object-cover" />
                ) : (
                    <div className="w-full h-full rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold" style={{ fontSize: size * 0.22 }}>
                        {initials}
                    </div>
                )}
            </div>
            {/* Crown for first to finish */}
            {isFirst && (
                <div className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-yellow flex items-center justify-center animate-scale-in">
                    <Crown size={11} className="text-white" />
                </div>
            )}
        </div>
    );
}

// Sync current user's progress to the shared district collection
export function useDistrictSync() {
    const { user } = useAuth();
    const { getCompletionCount, getStreak } = useTasks();

    const dailyCompleted = getCompletionCount(dailyTasks.map(t => t.id), 'daily');
    const streak = getStreak();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce sync to avoid writing on every single task toggle
    useEffect(() => {
        if (!user) return;

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            const today = toLocalDateString();
            const summaryRef = doc(db, 'district', 'daily', today, user.uid);

            const data: Record<string, unknown> = {
                uid: user.uid,
                name: user.name || 'GM',
                store: user.store || null,
                photoURL: user.photoURL || null,
                dailyCompleted,
                dailyTotal: dailyTasks.length,
                streak,
                updatedAt: new Date().toISOString(),
            };

            if (dailyCompleted === dailyTasks.length) {
                data.completedAllAt = new Date().toISOString();
            }

            setDoc(summaryRef, data, { merge: true }).catch(err =>
                console.warn('District sync failed:', err)
            );
        }, 2000); // 2s debounce

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [user, dailyCompleted, streak]);
}

// Listen to all GMs' progress for today
export function useDistrictPulse(): GMSummary[] {
    const [summaries, setSummaries] = useState<GMSummary[]>([]);

    useEffect(() => {
        const today = toLocalDateString();
        const colRef = collection(db, 'district', 'daily', today);

        const unsub = onSnapshot(colRef, (snap) => {
            const data = snap.docs.map(d => d.data() as GMSummary);
            setSummaries(data);
        }, (err) => {
            console.warn('District pulse error:', err);
        });

        return () => unsub();
    }, []);

    return summaries;
}

// The visual component
export default function DistrictPulse() {
    const summaries = useDistrictPulse();
    const { user } = useAuth();

    if (summaries.length <= 1) return null; // Only show when multiple GMs

    // Sort: 100% first (by completedAllAt), then by completion %
    const sorted = [...summaries].sort((a, b) => {
        const aPct = a.dailyTotal > 0 ? a.dailyCompleted / a.dailyTotal : 0;
        const bPct = b.dailyTotal > 0 ? b.dailyCompleted / b.dailyTotal : 0;
        if (aPct === 1 && bPct === 1) {
            return (a.completedAllAt || '').localeCompare(b.completedAllAt || '');
        }
        return bPct - aPct;
    });

    const firstFinisher = sorted.find(s => s.dailyCompleted === s.dailyTotal);
    const morningDone = summaries.filter(s => {
        const pct = s.dailyTotal > 0 ? s.dailyCompleted / s.dailyTotal : 0;
        return pct >= 0.36; // ~4/11 = morning tasks done
    }).length;

    const topStreaker = [...summaries].sort((a, b) => b.streak - a.streak)[0];

    return (
        <div className="card p-5 space-y-4" style={{ overflow: 'visible' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-navy" />
                    <h3 className="font-semibold text-navy-dark text-[15px]">District Pulse</h3>
                    <span className="badge badge-green text-[10px]">LIVE</span>
                </div>
                <span className="text-xs text-gray-400">{summaries.length} GM{summaries.length !== 1 ? 's' : ''} active</span>
            </div>

            {/* GM Progress Rings */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-3">
                {sorted.map((gm) => {
                    const pct = gm.dailyTotal > 0 ? Math.round((gm.dailyCompleted / gm.dailyTotal) * 100) : 0;
                    const isFirst = firstFinisher?.uid === gm.uid;
                    const isMe = gm.uid === user?.uid;
                    return (
                        <div key={gm.uid} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                            <ProgressRing
                                percent={pct}
                                photoURL={gm.photoURL}
                                name={gm.name}
                                isFirst={isFirst}
                                size={52}
                                strokeWidth={3}
                            />
                            <span className={`text-[11px] font-medium truncate max-w-[64px] ${isMe ? 'text-navy-dark font-bold' : 'text-gray-500'}`}>
                                {isMe ? 'You' : gm.name.split(' ')[0]}
                            </span>
                            <span className={`text-[10px] font-bold ${pct === 100 ? 'text-green' : pct >= 50 ? 'text-yellow' : 'text-gray-400'}`}>
                                {pct}%
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 text-xs text-gray-500">
                <TrendingUp size={14} className="text-green flex-shrink-0" />
                <span>
                    <strong className="text-navy-dark">{morningDone} of {summaries.length}</strong> GMs have completed morning tasks
                </span>
            </div>

            {/* First to Finish */}
            {firstFinisher && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-yellow-light/20 border border-yellow/20">
                    <Crown size={14} className="text-yellow flex-shrink-0" />
                    <span className="text-xs font-medium text-navy-dark">
                        👑 <strong>{firstFinisher.uid === user?.uid ? 'You were' : `${firstFinisher.name.split(' ')[0]} was`}</strong> first to finish today!
                    </span>
                </div>
            )}

            {/* Streak Leader */}
            {topStreaker && topStreaker.streak > 0 && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-navy-dark/5">
                    <Flame size={14} className="text-yellow flex-shrink-0" />
                    <span className="text-xs text-gray-500">
                        Longest streak: <strong className="text-navy-dark">
                            {topStreaker.uid === user?.uid ? 'You' : topStreaker.name.split(' ')[0]}
                        </strong> — {topStreaker.streak} days 🔥
                    </span>
                </div>
            )}
        </div>
    );
}
