'use client';

import React from 'react';
import { MiniBar } from '@/components/ui/ProgressRing';
import { Users2, ArrowRight, CheckCircle2, Target, Trophy } from 'lucide-react';
import { DelegationEvent } from '@/lib/tasks';

interface DelegationSectionProps {
    dailyDelegated: number;
    dailyPending: number;
    delegatedToday: number;
    verifiedToday: number;
    cancelledToday: number;
    delegationSuccessRate: number | null;
    uniqueDelegates: number;
    delegationRate: number;
    timeSaved: number;
    selfCompletedToday: number;
    showAntiPattern: boolean;
    DELEGATION_DAILY_TARGET: number;
    delegationBadges: { id: string; label: string; desc: string; earned: boolean; icon: string }[];
}

export default function DelegationSection({
    dailyDelegated, dailyPending, delegatedToday, verifiedToday, cancelledToday,
    delegationSuccessRate, uniqueDelegates, delegationRate, timeSaved,
    selfCompletedToday, showAntiPattern, DELEGATION_DAILY_TARGET, delegationBadges,
}: DelegationSectionProps) {
    return (
        <>
            {/* 👥 Delegation Health */}
            {(dailyDelegated > 0 || delegatedToday > 0) && (
                <div className="card p-5" title="Tracks how effectively you delegate to your team. Active = currently delegated tasks. Success Rate = % of delegated tasks that were verified complete (vs cancelled). Higher success rate = more reliable delegation.">
                    <div className="flex items-center gap-2 mb-4">
                        <Users2 size={16} className="text-navy" />
                        <h3 className="font-semibold text-navy-dark text-[15px]">Delegation Health</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-xl bg-blue-info-light/20 p-3" title={`${dailyDelegated} daily tasks currently assigned to team members. ${dailyPending} still need you to verify they were completed.`}>
                            <div className="flex items-center gap-2 mb-1">
                                <ArrowRight size={14} className="text-blue-info" />
                                <span className="text-xs font-medium text-gray-500">Active</span>
                            </div>
                            <p className="text-2xl font-bold text-navy-dark">{dailyDelegated}</p>
                            <p className="text-[10px] text-gray-400">{dailyPending} pending follow-up</p>
                        </div>
                        <div className="rounded-xl bg-green-light/20 p-3" title={`Percentage of delegated tasks you confirmed done vs total delegated today. ${verifiedToday} verified ✓ and ${cancelledToday} cancelled ✗ out of ${delegatedToday} delegated.`}>
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 size={14} className="text-green" />
                                <span className="text-xs font-medium text-gray-500">Success Rate</span>
                            </div>
                            <p className="text-2xl font-bold text-navy-dark">
                                {delegationSuccessRate !== null ? `${delegationSuccessRate}%` : '—'}
                            </p>
                            <p className="text-[10px] text-gray-400">{verifiedToday} verified / {cancelledToday} cancelled</p>
                        </div>
                    </div>
                    {uniqueDelegates > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100" title="Number of different team members you've delegated to today. Spreading work across more team members develops more leaders.">
                            <Users2 size={12} />
                            <span>{uniqueDelegates} team member{uniqueDelegates > 1 ? 's' : ''} utilized today</span>
                        </div>
                    )}
                </div>
            )}

            {/* 🎯 Delegation Target — Daily Goal */}
            <div className="card p-5" title={`Daily delegation target: ${DELEGATION_DAILY_TARGET} tasks. Delegating regularly develops your team and frees your time for strategic work. Today: ${delegatedToday} of ${DELEGATION_DAILY_TARGET} delegated.`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Target size={16} className="text-navy" />
                        <h3 className="font-semibold text-navy-dark text-[15px]">Delegation Target</h3>
                    </div>
                    <span className={`text-sm font-bold ${delegatedToday >= DELEGATION_DAILY_TARGET ? 'text-green' : 'text-navy-dark'}`}>
                        {delegatedToday}/{DELEGATION_DAILY_TARGET}
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${Math.min((delegatedToday / DELEGATION_DAILY_TARGET) * 100, 100)}%`,
                        background: delegatedToday >= DELEGATION_DAILY_TARGET ? 'var(--green)' : delegatedToday > 0 ? 'var(--yellow)' : 'var(--gray-300)',
                    }} />
                </div>
                <p className="text-xs text-gray-400">
                    {delegatedToday >= DELEGATION_DAILY_TARGET
                        ? '✅ Target reached! Great delegation today.'
                        : delegatedToday > 0
                            ? `${DELEGATION_DAILY_TARGET - delegatedToday} more delegation${DELEGATION_DAILY_TARGET - delegatedToday > 1 ? 's' : ''} to hit your goal`
                            : 'Delegate your first task to get started — look for "Delegate this" badges on your tasks'}
                </p>
            </div>

            {/* 📊 Delegation Score + Time Saved */}
            <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 text-center" title={`Delegation rate: the percentage of tasks you delegated out of all tasks handled today. ${delegationRate}%. Green: 40%+, Yellow: 20-40%, Red: <20%.`}>
                    <p className="text-[10px] text-gray-400 font-medium mb-1">Delegation Rate</p>
                    <p className={`text-2xl font-bold ${delegationRate >= 40 ? 'text-green' : delegationRate >= 20 ? 'text-yellow' : 'text-red-accent'}`}>
                        {delegationRate}%
                    </p>
                    <MiniBar percent={delegationRate} color={delegationRate >= 40 ? 'var(--green)' : delegationRate >= 20 ? 'var(--yellow)' : 'var(--red-accent)'} />
                </div>
                <div className="card p-4 text-center" title={`Estimated time freed up today by delegating.${timeSaved > 0 ? ` You saved ~${timeSaved} minutes today.` : ''}`}>
                    <p className="text-[10px] text-gray-400 font-medium mb-1">Time Freed</p>
                    <p className="text-2xl font-bold text-navy-dark">
                        {timeSaved > 0 ? `${timeSaved}m` : '—'}
                    </p>
                    <p className="text-[10px] text-gray-400">{timeSaved > 0 ? 'saved by delegating' : 'delegate to save time'}</p>
                </div>
            </div>

            {/* ⚠️ Anti-Pattern Alert */}
            {showAntiPattern && (
                <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-yellow/30 bg-gradient-to-r from-yellow-light/20 to-orange-100/20 animate-fade-in" title="This alert appears when you've completed 5+ tasks yourself without delegating any.">
                    <span className="text-xl mt-0.5">🪞</span>
                    <div>
                        <p className="text-sm font-semibold text-navy-dark">You&apos;ve completed {selfCompletedToday} tasks yourself with 0 delegations</p>
                        <p className="text-xs text-gray-500 mt-1">Are you developing your team? Try delegating your next task — look for the <span className="text-blue-info font-medium">👥 Delegate this</span> badges on your task list.</p>
                    </div>
                </div>
            )}

            {/* 🏅 Delegation Badges */}
            <div className="card p-5" title="Delegation-specific badges that reward consistent delegation behavior.">
                <div className="flex items-center gap-2 mb-3">
                    <Trophy size={16} className="text-yellow" />
                    <h3 className="font-semibold text-navy-dark text-[15px]">Delegation Badges</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {delegationBadges.map(b => (
                        <div key={b.id} className={`p-3 rounded-xl text-center transition-colors ${b.earned ? 'bg-yellow-light/30 border border-yellow/20' : 'bg-gray-50 opacity-50'}`} title={b.desc}>
                            <span className="text-xl mb-1 block">{b.icon}</span>
                            <p className={`text-xs font-semibold ${b.earned ? 'text-navy-dark' : 'text-gray-400'}`}>{b.label}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
