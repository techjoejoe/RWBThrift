'use client';

import React from 'react';
import { MiniBar } from '@/components/ui/ProgressRing';
import { Clock, Timer, Zap, BarChart3 } from 'lucide-react';

interface TimeWindowStat {
    window: string;
    label: string;
    total: number;
    completed: number;
    isPast: boolean;
    isCurrent: boolean;
}

interface PerformanceMetricsProps {
    timeWindowStats: TimeWindowStat[];
    firstTaskTime: string | null;
    tasksPerHour: string | null;
    consistencyScore: number;
    totalDone: number;
    totalTasks: number;
}

export default function PerformanceMetrics({
    timeWindowStats, firstTaskTime, tasksPerHour, consistencyScore, totalDone, totalTasks,
}: PerformanceMetricsProps) {
    return (
        <>
            {/* Completion by Time Window */}
            <div className="card p-5" title="Shows how many tasks are completed in each time block.">
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-navy" />
                    <h3 className="font-semibold text-navy-dark text-[15px]">Completion by Time Window</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {timeWindowStats.map(tw => {
                        const pct = tw.total > 0 ? Math.round((tw.completed / tw.total) * 100) : 0;
                        const barColor = pct === 100 ? 'var(--green)' : tw.isPast && pct < 100 ? 'var(--red-accent)' : tw.isCurrent ? 'var(--yellow)' : 'var(--gray-300)';
                        const windowTimes = tw.window === 'morning' ? 'Before 10am' : tw.window === 'midday' ? '10am – 2pm' : tw.window === 'afternoon' ? '2pm – 5pm' : 'After 5pm';
                        return (
                            <div key={tw.window} className={`text-center p-2.5 rounded-xl transition-colors ${tw.isCurrent ? 'bg-yellow-light/20 border border-yellow/20' : tw.isPast && pct < 100 ? 'bg-red-alert-light/50' : ''}`} title={`${tw.label} (${windowTimes}): ${tw.completed} of ${tw.total} tasks completed (${pct}%).${tw.isPast && pct < 100 ? ' ⚠️ This window has passed with incomplete tasks.' : ''}${tw.isCurrent ? ' ← You are here now.' : ''}`}>
                                <p className="text-lg mb-1">{tw.label.split(' ')[0]}</p>
                                <p className="text-lg font-bold text-navy-dark">{tw.completed}/{tw.total}</p>
                                <MiniBar percent={pct} color={barColor} />
                                <p className="text-[10px] text-gray-400 mt-1">{pct}%</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Efficiency Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="card p-4 text-center" title="The time you completed your first task today.">
                    <Timer size={18} className="mx-auto text-navy mb-1" />
                    <p className="text-lg font-bold text-navy-dark">{firstTaskTime || '—'}</p>
                    <p className="text-[10px] text-gray-400 font-medium">First Task</p>
                </div>
                <div className="card p-4 text-center" title="Average throughput — total completed tasks divided by hours since first task.">
                    <Zap size={18} className="mx-auto text-yellow mb-1" />
                    <p className="text-lg font-bold text-navy-dark">{tasksPerHour || '—'}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Tasks / Hour</p>
                </div>
                <div className="card p-4 text-center" title={`Overall consistency across ALL categories. ${totalDone} of ${totalTasks} total = ${consistencyScore}%.`}>
                    <BarChart3 size={18} className="mx-auto text-green mb-1" />
                    <p className="text-lg font-bold text-navy-dark">{consistencyScore}%</p>
                    <p className="text-[10px] text-gray-400 font-medium">Overall Score</p>
                </div>
            </div>
        </>
    );
}
