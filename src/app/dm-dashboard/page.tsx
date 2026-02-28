'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { loadGMData, GMData } from '@/lib/services/dmAnalytics';
import GMCard from '@/components/dm-dashboard/GMCard';
import AnalyticsView from '@/components/dm-dashboard/AnalyticsView';
import AppShell from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/Skeletons';
import {
    AlertTriangle, TrendingUp, Users, UserCheck, Shield, RefreshCw,
} from 'lucide-react';
import { SUPER_ADMIN_UID } from '@/lib/constants';

export default function DMDashboardPage() {
    const router = useRouter();
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const [gms, setGMs] = useState<GMData[]>([]);
    const [expandedGM, setExpandedGM] = useState<string | null>(null);
    const [view, setView] = useState<'overview' | 'analytics'>('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.replace('/login');
    }, [authLoading, isAuthenticated, router]);

    const isDM = user?.role === 'dm' || user?.uid === SUPER_ADMIN_UID;

    const fetchData = async () => {
        if (!user?.uid) return;
        try {
            const data = await loadGMData(user.uid);
            setGMs(data);
        } catch (err) { console.warn('Failed to load GM data:', err); }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        if (!isDM) return;
        fetchData();
    }, [isDM]);

    if (authLoading || !user) return null;

    if (!isDM) {
        return (
            <AppShell>
                <div className="card p-8 text-center mt-12">
                    <Shield size={40} className="mx-auto mb-4 text-red-accent" />
                    <h2 className="text-xl font-bold text-navy-dark mb-2">Access Denied</h2>
                    <p className="text-gray-400 text-sm">Only District Managers can access this page.</p>
                </div>
            </AppShell>
        );
    }

    const behindCount = gms.filter(g => g.daily.total > 0 && (g.daily.completed / g.daily.total) < 0.5).length;
    const avgDaily = gms.length > 0 ? Math.round(gms.reduce((s, g) => s + (g.daily.total > 0 ? Math.round((g.daily.completed / g.daily.total) * 100) : 0), 0) / gms.length) : 0;
    const totalDelegated = gms.reduce((s, g) => s + g.daily.delegated + g.weekly.delegated + g.monthly.delegated, 0);
    const totalCompleted = gms.reduce((s, g) => s + g.daily.completed + g.weekly.completed + g.monthly.completed, 0);
    const delegationPct = totalCompleted > 0 ? Math.round((totalDelegated / totalCompleted) * 100) : 0;
    const onboardingCount = gms.filter(g => g.isOnboarding).length;

    const handleRefresh = () => { setRefreshing(true); fetchData(); };

    return (
        <AppShell>
            <div className="space-y-5 animate-slide-up">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-navy-dark">District Overview</h1>
                        <p className="text-gray-400 text-sm mt-1">Live data from all stores</p>
                    </div>
                    <button onClick={handleRefresh} className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${refreshing ? 'animate-spin' : ''}`} title="Refresh data">
                        <RefreshCw size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-50 rounded-xl p-1">
                    <button onClick={() => setView('overview')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'overview' ? 'bg-white text-navy-dark shadow-sm' : 'text-gray-400'}`}>
                        Overview
                    </button>
                    <button onClick={() => setView('analytics')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'analytics' ? 'bg-white text-navy-dark shadow-sm' : 'text-gray-400'}`}>
                        Analytics
                    </button>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="card p-4 text-center">
                        <Users size={18} className="mx-auto text-gray-300 mb-1" />
                        <p className="text-2xl font-bold text-navy-dark">{gms.length}</p>
                        <p className="text-xs text-gray-400">Total GMs</p>
                    </div>
                    <div className="card p-4 text-center">
                        <TrendingUp size={18} className="mx-auto text-green mb-1" />
                        <p className="text-2xl font-bold text-navy-dark">{avgDaily}%</p>
                        <p className="text-xs text-gray-400">Avg Daily</p>
                    </div>
                    <div className="card p-4 text-center">
                        <UserCheck size={18} className="mx-auto text-blue-info mb-1" />
                        <p className="text-2xl font-bold text-navy-dark">{delegationPct}%</p>
                        <p className="text-xs text-gray-400">Delegated</p>
                    </div>
                    <div className="card p-4 text-center">
                        <AlertTriangle size={18} className="mx-auto text-red-accent mb-1" />
                        <p className="text-2xl font-bold text-navy-dark">{behindCount}</p>
                        <p className="text-xs text-gray-400">Behind</p>
                    </div>
                </div>

                {/* Alerts */}
                {behindCount > 0 && (
                    <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-red-accent/20 bg-red-alert-light">
                        <AlertTriangle size={16} className="text-red-accent flex-shrink-0" />
                        <span className="text-sm font-medium text-red-accent">
                            {behindCount} GM{behindCount > 1 ? 's' : ''} below 50% daily completion. Review and follow up.
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="card p-8 text-center text-gray-400">
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-navy rounded-full animate-spin mx-auto mb-3" /> Loading store data...
                    </div>
                ) : view === 'overview' ? (
                    <div className="space-y-3">
                        {gms.length === 0 && (
                            <div className="card p-8 text-center text-gray-400 text-sm">No GMs registered yet</div>
                        )}
                        {gms.map((gm) => (
                            <GMCard
                                key={gm.uid}
                                gm={gm}
                                isExpanded={expandedGM === gm.uid}
                                onToggle={() => setExpandedGM(expandedGM === gm.uid ? null : gm.uid)}
                            />
                        ))}
                    </div>
                ) : (
                    <AnalyticsView
                        gms={gms}
                        totalCompleted={totalCompleted}
                        totalDelegated={totalDelegated}
                        delegationPct={delegationPct}
                        onboardingCount={onboardingCount}
                    />
                )}
            </div>
        </AppShell>
    );
}
