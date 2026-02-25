'use client';

import React from 'react';
import { GMData } from '@/lib/services/dmAnalytics';
import { MiniBar } from '@/components/ui/ProgressRing';
import { PieChart, BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
    gms: GMData[];
    totalCompleted: number;
    totalDelegated: number;
    delegationPct: number;
    onboardingCount: number;
}

export default function AnalyticsView({ gms, totalCompleted, totalDelegated, delegationPct, onboardingCount }: AnalyticsViewProps) {
    return (
        <div className="space-y-5">
            {/* District-wide Delegation */}
            <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <PieChart size={16} className="text-navy" />
                    <h3 className="font-semibold text-navy-dark text-[15px]">District Delegation Overview</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                        <p className="text-2xl font-bold text-navy-dark">{totalCompleted}</p>
                        <p className="text-xs text-gray-400">Total Completed</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-info">{totalDelegated}</p>
                        <p className="text-xs text-gray-400">Delegated</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green">{totalCompleted - totalDelegated}</p>
                        <p className="text-xs text-gray-400">Self-Completed</p>
                    </div>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-green rounded-l-full" style={{ width: `${totalCompleted > 0 ? 100 - delegationPct : 0}%` }} />
                    <div className="h-full bg-blue-info rounded-r-full" style={{ width: `${delegationPct}%` }} />
                </div>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green" /> Self ({100 - delegationPct}%)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-info" /> Delegated ({delegationPct}%)</span>
                </div>
            </div>

            {/* Delegation Rate by GM */}
            <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={16} className="text-navy" />
                    <h3 className="font-semibold text-navy-dark text-[15px]">Delegation Rate by GM</h3>
                </div>
                <div className="space-y-3">
                    {gms.map(gm => {
                        const gmDel = gm.daily.delegated + gm.weekly.delegated + gm.monthly.delegated;
                        const gmComp = gm.daily.completed + gm.weekly.completed + gm.monthly.completed;
                        const rate = gmComp > 0 ? Math.round((gmDel / gmComp) * 100) : 0;
                        return (
                            <div key={gm.uid}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-navy-dark font-medium">{gm.name}</span>
                                    <span className="text-xs font-semibold text-blue-info">{rate}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-green" style={{ width: `${100 - rate}%` }} />
                                    <div className="h-full bg-blue-info" style={{ width: `${rate}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Daily Completion Ranking */}
            <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-green" />
                    <h3 className="font-semibold text-navy-dark text-[15px]">Daily Completion Ranking</h3>
                </div>
                <div className="space-y-2">
                    {gms.map((gm, i) => {
                        const pct = gm.daily.total > 0 ? Math.round((gm.daily.completed / gm.daily.total) * 100) : 0;
                        return (
                            <div key={gm.uid} className="flex items-center gap-3">
                                <span className={`text-sm font-bold w-6 text-center ${i === 0 ? 'text-yellow' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-red-light' : 'text-gray-300'}`}>
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                </span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-sm text-navy-dark">{gm.name}</span>
                                        <span className={`text-xs font-bold ${pct >= 80 ? 'text-green' : pct >= 50 ? 'text-yellow' : 'text-red-accent'}`}>{pct}%</span>
                                    </div>
                                    <MiniBar percent={pct} color={pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red-accent)'} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Onboarding GMs */}
            {onboardingCount > 0 && (
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={16} className="text-blue-info" />
                        <h3 className="font-semibold text-navy-dark text-[15px]">GMs in Onboarding ({onboardingCount})</h3>
                    </div>
                    <div className="space-y-2">
                        {gms.filter(g => g.isOnboarding).map(gm => (
                            <div key={gm.uid} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-navy-dark">{gm.name}</p>
                                    <p className="text-xs text-gray-400">{gm.store}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-navy-dark">Day {gm.onboardingDay || '?'}/20</span>
                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-blue-info" style={{ width: `${((gm.onboardingDay || 0) / 20) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
