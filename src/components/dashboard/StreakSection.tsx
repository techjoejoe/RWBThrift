'use client';

import React from 'react';
import { Flame, Award, Trophy } from 'lucide-react';

interface StreakSectionProps {
    streak: number;
    dailyCompleted: number;
    dailyTotal: number;
}

export default function StreakSection({ streak, dailyCompleted, dailyTotal }: StreakSectionProps) {
    return (
        <>
            {/* Streak Calendar */}
            <div className="card p-5" title="Visual history of your daily completion streak over the last 7 days. Green = all daily tasks completed that day.">
                <div className="flex items-center gap-2 mb-4">
                    <Award size={16} className="text-yellow" />
                    <h3 className="font-semibold text-navy-dark text-[15px]">Streak Calendar</h3>
                </div>
                <div className="flex gap-2 justify-between">
                    {Array.from({ length: 7 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
                        const dateLabel = d.getDate();
                        const isToday = i === 6;
                        const daysAgo = 6 - i;
                        const wasActive = daysAgo < streak;
                        const isTodayComplete = isToday && dailyCompleted === dailyTotal;

                        return (
                            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                                <span className="text-[10px] text-gray-400 font-medium">{dayLabel}</span>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isTodayComplete ? 'bg-green text-white'
                                    : isToday ? 'bg-yellow-light/50 border-2 border-yellow text-navy-dark'
                                        : wasActive ? 'bg-green-light/40 text-green border border-green/20'
                                            : 'bg-gray-50 text-gray-300'
                                    }`}>
                                    {isTodayComplete ? '✓' : dateLabel}
                                </div>
                                {isToday && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-navy" />
                                )}
                            </div>
                        );
                    })}
                </div>
                {streak > 0 ? (
                    <p className="text-xs text-gray-400 text-center mt-3">
                        🔥 {streak}-day streak — {dailyCompleted === dailyTotal ? 'Today is locked in!' : `Complete ${dailyTotal - dailyCompleted} more to extend it!`}
                    </p>
                ) : (
                    <p className="text-xs text-gray-400 text-center mt-3">
                        Complete all daily tasks to start a streak
                    </p>
                )}
            </div>

            {/* Best Day Score + Achievements */}
            <div className="grid grid-cols-3 gap-3">
                <div className={`card p-4 text-center ${dailyCompleted === dailyTotal ? 'border border-green/20 bg-green-light/10' : ''}`} title={`Today's daily task completion: ${dailyCompleted} out of ${dailyTotal}.`}>
                    <Trophy size={18} className={`mx-auto mb-1 ${dailyCompleted === dailyTotal ? 'text-green' : 'text-gray-300'}`} />
                    <p className="text-lg font-bold text-navy-dark">{dailyCompleted}/{dailyTotal}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Today&apos;s Score</p>
                </div>
                <div className={`card p-4 text-center ${streak >= 3 ? 'border border-yellow/20 bg-yellow-light/10' : ''}`} title="3-Day Streak Badge: Complete all daily tasks for 3 consecutive days.">
                    <Flame size={18} className={`mx-auto mb-1 ${streak >= 3 ? 'text-yellow' : 'text-gray-300'}`} />
                    <p className="text-lg font-bold text-navy-dark">{streak >= 3 ? '✓' : `${3 - streak} to go`}</p>
                    <p className="text-[10px] text-gray-400 font-medium">3-Day Badge</p>
                </div>
                <div className={`card p-4 text-center ${streak >= 7 ? 'border border-yellow/20 bg-yellow-light/10' : ''}`} title="7-Day Streak Badge: Complete all daily tasks for 7 consecutive days.">
                    <Award size={18} className={`mx-auto mb-1 ${streak >= 7 ? 'text-yellow' : 'text-gray-300'}`} />
                    <p className="text-lg font-bold text-navy-dark">{streak >= 7 ? '✓' : `${7 - streak} to go`}</p>
                    <p className="text-[10px] text-gray-400 font-medium">7-Day Badge</p>
                </div>
            </div>
        </>
    );
}
