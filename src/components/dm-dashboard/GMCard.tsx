'use client';

import React from 'react';
import { GMData } from '@/lib/services/dmAnalytics';
import { MiniBar } from '@/components/ui/ProgressRing';
import { TrendingUp, TrendingDown, ChevronRight, ChevronDown, UserCheck } from 'lucide-react';

function StatusBadge({ status }: { status: 'on-track' | 'behind' }) {
    return status === 'on-track' ? (
        <span className="badge badge-green"><TrendingUp size={12} /> On Track</span>
    ) : (
        <span className="badge badge-red"><TrendingDown size={12} /> Behind</span>
    );
}

interface GMCardProps {
    gm: GMData;
    isExpanded: boolean;
    onToggle: () => void;
}

export default function GMCard({ gm, isExpanded, onToggle }: GMCardProps) {
    const dailyPct = gm.daily.total > 0 ? Math.round((gm.daily.completed / gm.daily.total) * 100) : 0;
    const weeklyPct = gm.weekly.total > 0 ? Math.round((gm.weekly.completed / gm.weekly.total) * 100) : 0;
    const monthlyPct = gm.monthly.total > 0 ? Math.round((gm.monthly.completed / gm.monthly.total) * 100) : 0;
    const gmDelegated = gm.daily.delegated + gm.weekly.delegated + gm.monthly.delegated;
    const gmTotal = gm.daily.completed + gm.weekly.completed + gm.monthly.completed;
    const gmDelegPct = gmTotal > 0 ? Math.round((gmDelegated / gmTotal) * 100) : 0;
    const status = dailyPct >= 50 ? 'on-track' as const : 'behind' as const;

    return (
        <div className="card overflow-hidden">
            <button onClick={onToggle} className="w-full px-5 py-4 text-left">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-bold text-navy">
                            {gm.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-navy-dark text-[15px]">{gm.name}</h3>
                            <p className="text-xs text-gray-400">{gm.store}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {gm.streak > 0 && (
                            <span className="text-xs font-semibold text-yellow">🔥 {gm.streak}</span>
                        )}
                        <StatusBadge status={status} />
                        {isExpanded ? <ChevronDown size={16} className="text-gray-300" /> : <ChevronRight size={16} className="text-gray-300" />}
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Daily', pct: dailyPct, done: gm.daily.completed, total: gm.daily.total, del: gm.daily.delegated },
                        { label: 'Weekly', pct: weeklyPct, done: gm.weekly.completed, total: gm.weekly.total, del: gm.weekly.delegated },
                        { label: 'Monthly', pct: monthlyPct, done: gm.monthly.completed, total: gm.monthly.total, del: gm.monthly.delegated },
                    ].map(p => (
                        <div key={p.label}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-gray-400">{p.label}</span>
                                <span className="text-[11px] font-semibold text-navy-dark">
                                    {p.done}/{p.total}
                                    {p.del > 0 && <span className="text-blue-info ml-0.5">({p.del}d)</span>}
                                </span>
                            </div>
                            <MiniBar percent={p.pct} color={p.pct >= 80 ? 'var(--green)' : p.pct >= 50 ? 'var(--yellow)' : 'var(--red-accent)'} />
                        </div>
                    ))}
                </div>
            </button>

            {/* Expanded Detail */}
            {isExpanded && (
                <div className="px-5 pb-4 space-y-4 border-t border-gray-100 pt-4 animate-fade-in">
                    <div className="card p-4 bg-blue-info-light/20 border border-blue-info/10">
                        <div className="flex items-center gap-2 mb-3">
                            <UserCheck size={14} className="text-blue-info" />
                            <span className="text-xs font-semibold text-navy-dark">Delegation Summary</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <p className="text-xl font-bold text-navy-dark">{gmDelegated}</p>
                                <p className="text-[11px] text-gray-400">Delegated</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-navy-dark">{gmDelegPct}%</p>
                                <p className="text-[11px] text-gray-400">Rate</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-navy-dark">{gm.streak}</p>
                                <p className="text-[11px] text-gray-400">Streak</p>
                            </div>
                        </div>
                        {gm.delegates.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-blue-info/10">
                                <p className="text-[11px] text-gray-400 mb-1.5">Delegated to:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {gm.delegates.map(d => (
                                        <span key={d} className="badge badge-blue text-[10px]">{d}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {gm.isOnboarding && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-light/30 border border-yellow/20">
                            <span className="text-xs text-navy-dark font-medium">📚 Onboarding Day {gm.onboardingDay || '?'}/20</span>
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-blue-info" style={{ width: `${((gm.onboardingDay || 0) / 20) * 100}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
