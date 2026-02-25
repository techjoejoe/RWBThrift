'use client';

import React from 'react';
import Link from 'next/link';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ArrowRight } from 'lucide-react';

interface ProgressCardProps {
    title: string;
    completed: number;
    total: number;
    period: string;
    color: string;
    tooltip?: string;
}

export default function ProgressCard({ title, completed, total, period, color, tooltip }: ProgressCardProps) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
        <div className="card p-5 flex items-center gap-4 animate-fade-in" title={tooltip}>
            <div className="relative flex-shrink-0">
                <ProgressRing percent={percent} color={color} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color }}>{percent}%</span>
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-dark text-[15px]">{title}</h3>
                <p className="text-gray-400 text-sm">{completed} of {total} {period}</p>
            </div>
            <Link href="/tasks" className="text-gray-300 hover:text-navy transition-colors">
                <ArrowRight size={20} />
            </Link>
        </div>
    );
}
