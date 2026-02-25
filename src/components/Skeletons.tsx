'use client';

import React from 'react';

/** Base skeleton block with shimmer animation */
export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
    return <div className={`skeleton ${className}`} style={style} />;
}

/** Skeleton for a text line */
export function SkeletonText({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
    return <Skeleton style={{ width, height, borderRadius: 6 }} />;
}

/** Skeleton for a circular avatar */
export function SkeletonCircle({ size = 40 }: { size?: number }) {
    return <Skeleton style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />;
}

/** Skeleton card row — avatar + text lines */
export function SkeletonCard() {
    return (
        <div className="card px-5 py-4 flex items-center gap-4">
            <SkeletonCircle />
            <div className="flex-1 space-y-2">
                <SkeletonText width="60%" height={16} />
                <SkeletonText width="40%" height={12} />
            </div>
        </div>
    );
}

/** Skeleton for stat cards (3 columns) */
export function SkeletonStats() {
    return (
        <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="card p-4 text-center space-y-2">
                    <Skeleton style={{ width: 50, height: 28, margin: '0 auto', borderRadius: 8 }} />
                    <Skeleton style={{ width: 40, height: 10, margin: '0 auto', borderRadius: 4 }} />
                </div>
            ))}
        </div>
    );
}

/** Full dashboard skeleton */
export function DashboardSkeleton() {
    return (
        <div className="space-y-5 animate-fade-in">
            {/* Greeting */}
            <div className="space-y-2">
                <SkeletonText width="55%" height={24} />
                <SkeletonText width="35%" height={14} />
            </div>

            {/* Streak card */}
            <div className="card p-5 flex items-center gap-4">
                <Skeleton style={{ width: 48, height: 48, borderRadius: 16 }} />
                <div className="flex-1 space-y-2">
                    <SkeletonText width="40%" height={16} />
                    <SkeletonText width="70%" height={12} />
                </div>
            </div>

            {/* Progress cards */}
            <SkeletonStats />

            {/* Grade card */}
            <div className="card px-5 py-4 flex items-center gap-4">
                <Skeleton style={{ width: 40, height: 40, borderRadius: 10 }} />
                <div className="flex-1 space-y-2">
                    <SkeletonText width="45%" height={16} />
                    <SkeletonText width="65%" height={12} />
                </div>
            </div>

            {/* Time windows */}
            <div className="card p-5 space-y-4">
                <SkeletonText width="55%" height={16} />
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="text-center space-y-2 p-2.5">
                            <Skeleton style={{ width: 24, height: 24, margin: '0 auto', borderRadius: 6 }} />
                            <Skeleton style={{ width: '100%', height: 6, borderRadius: 3 }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Task cards */}
            {[1, 2, 3].map(i => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

/** Tasks page skeleton */
export function TasksSkeleton() {
    return (
        <div className="space-y-5 animate-fade-in">
            <SkeletonText width="40%" height={24} />

            {/* Tab bar */}
            <div className="flex bg-gray-50 rounded-xl p-1">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex-1 py-2 flex justify-center">
                        <Skeleton style={{ width: 60, height: 16, borderRadius: 6 }} />
                    </div>
                ))}
            </div>

            {/* Progress summary */}
            <div className="card p-5 space-y-3">
                <div className="flex justify-between">
                    <SkeletonText width="30%" height={14} />
                    <SkeletonText width="15%" height={14} />
                </div>
                <Skeleton style={{ width: '100%', height: 8, borderRadius: 4 }} />
            </div>

            {/* Task items */}
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="card px-5 py-4 flex items-center gap-3">
                    <Skeleton style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0 }} />
                    <div className="flex-1 space-y-2">
                        <SkeletonText width={`${50 + Math.random() * 30}%`} height={15} />
                        <SkeletonText width={`${30 + Math.random() * 20}%`} height={11} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Generic page skeleton — works for any page */
export function PageSkeleton() {
    return (
        <div className="space-y-5 animate-fade-in">
            <div className="space-y-2">
                <SkeletonText width="45%" height={24} />
                <SkeletonText width="30%" height={14} />
            </div>
            <SkeletonStats />
            {[1, 2, 3, 4].map(i => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

/** Animated logo loader for full-page loading states */
export function LogoLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--off-white)' }}>
            <div className="flex flex-col items-center gap-5">
                {/* Animated shield */}
                <div className="relative">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center pulse-loader"
                        style={{ background: 'var(--red-accent)', boxShadow: '0 8px 32px rgba(196,30,58,0.25)' }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    {/* Orbiting dot */}
                    <div className="absolute inset-0" style={{ animation: 'spin 2s linear infinite' }}>
                        <div className="w-2.5 h-2.5 rounded-full absolute -top-1 left-1/2 -translate-x-1/2" style={{ background: 'var(--red-accent)' }} />
                    </div>
                </div>
                <div className="space-y-1 text-center">
                    <p className="text-sm font-bold text-navy-dark">GM Command Center</p>
                    <p className="text-xs text-gray-400">Loading your workspace...</p>
                </div>
            </div>
        </div>
    );
}
