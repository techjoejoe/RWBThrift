'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { toLocalDateString } from '@/lib/tasks';
import { SUPER_ADMIN_UID } from '@/lib/constants';
import { dailyTasks, weeklyTasks, monthlyTasks } from '@/data/tasks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getStores, createStore, deleteStore as removeStore, assignStoreToDistrict, StoreDoc } from '@/lib/services/stores';
import { getDistricts, createDistrict, deleteDistrict as removeDistrict, assignDM, DistrictDoc } from '@/lib/services/districts';
import { getUsers, changeUserRole, AppUser } from '@/lib/services/users';
import AppShell from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/Skeletons';
import {
    Shield, Users, Search, AlertTriangle, Plus, Trash2, X,
    Store, MapPin, ChevronDown, ChevronUp, Clock,
} from 'lucide-react';

type Tab = 'users' | 'stores' | 'districts' | 'analytics';

export default function AdminPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [tab, setTab] = useState<Tab>('analytics');

    // Data state
    const [users, setUsers] = useState<AppUser[]>([]);
    const [stores, setStores] = useState<StoreDoc[]>([]);
    const [districts, setDistricts] = useState<DistrictDoc[]>([]);

    // UI state
    const [search, setSearch] = useState('');
    const [confirmAction, setConfirmAction] = useState<{ uid: string; newRole: string } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [showAddStore, setShowAddStore] = useState(false);
    const [newDistrictName, setNewDistrictName] = useState('');
    const [showAddDistrict, setShowAddDistrict] = useState(false);
    const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
    const [taskTimings, setTaskTimings] = useState<Record<string, { durations: number[]; taskTitle: string; estimated: number }>>({});
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (!authLoading && !isAuthenticated) router.replace('/login'); }, [authLoading, isAuthenticated, router]);
    const isAdmin = user?.uid === SUPER_ADMIN_UID;

    // Load all data + analytics via service layer
    useEffect(() => {
        if (!isAdmin) return;
        const loadAll = async () => {
            try {
                const [u, s, d] = await Promise.all([getUsers(), getStores(), getDistricts()]);
                setUsers(u);
                setStores(s);
                setDistricts(d);

                // Auto-load analytics (timing is the default tab)
                setAnalyticsLoading(true);
                try {
                    const allTaskDefs = [...dailyTasks, ...weeklyTasks, ...monthlyTasks];
                    const timingMap: Record<string, { durations: number[]; taskTitle: string; estimated: number }> = {};
                    allTaskDefs.forEach(t => { timingMap[t.id] = { durations: [], taskTitle: t.title, estimated: t.estimatedMinutes || 10 }; });

                    const gmUsers = u.filter(usr => usr.role === 'gm' || usr.role === 'trainer');
                    const todayStr = toLocalDateString();
                    const now = new Date();
                    const dayOfWeek = now.getDay();
                    const monday = new Date(now);
                    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    const weekKey = `W-${toLocalDateString(monday)}`;
                    const monthKey = `M-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                    for (const gm of gmUsers) {
                        for (const period of [todayStr, weekKey, monthKey]) {
                            try {
                                const snap = await getDoc(doc(db, 'users', gm.uid, 'taskCompletions', period));
                                if (snap.exists()) {
                                    const completions = (snap.data()?.completions || {}) as Record<string, { durationSeconds?: number }>;
                                    Object.entries(completions).forEach(([taskId, c]) => {
                                        if (c?.durationSeconds && timingMap[taskId]) {
                                            timingMap[taskId].durations.push(c.durationSeconds);
                                        }
                                    });
                                }
                            } catch { }
                        }
                    }
                    setTaskTimings(timingMap);
                } catch (err) { console.warn('Analytics load failed:', err); }
                setAnalyticsLoading(false);

            } catch (err) { console.warn('Failed to load admin data:', err); }
            setLoading(false);
        };
        loadAll();
    }, [isAdmin]);

    // Actions via service layer
    const handleChangeRole = useCallback(async (uid: string, newRole: string) => {
        setActionLoading(true);
        try {
            await changeUserRole(uid, newRole);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
            setConfirmAction(null);
        } catch (err) { console.warn('Role update failed:', err); }
        setActionLoading(false);
    }, []);

    const handleAddStore = async () => {
        if (!newStoreName.trim()) return;
        const store = await createStore(newStoreName);
        setStores(prev => [...prev, store].sort((a, b) => a.name.localeCompare(b.name)));
        setNewStoreName(''); setShowAddStore(false);
    };

    const handleDeleteStore = async (id: string) => {
        await removeStore(id);
        setStores(prev => prev.filter(s => s.id !== id));
    };

    const handleAssignStoreToDistrict = async (storeId: string, districtId: string | null) => {
        await assignStoreToDistrict(storeId, districtId);
        setStores(prev => prev.map(s => s.id === storeId ? { ...s, districtId: districtId || undefined } : s));
    };

    const handleAddDistrict = async () => {
        if (!newDistrictName.trim()) return;
        const district = await createDistrict(newDistrictName);
        setDistricts(prev => [...prev, district].sort((a, b) => a.name.localeCompare(b.name)));
        setNewDistrictName(''); setShowAddDistrict(false);
    };

    const handleDeleteDistrict = async (id: string) => {
        const storeIds = stores.filter(s => s.districtId === id).map(s => s.id);
        await removeDistrict(id, storeIds);
        setDistricts(prev => prev.filter(d => d.id !== id));
        setStores(prev => prev.map(s => s.districtId === id ? { ...s, districtId: undefined } : s));
    };

    const handleAssignDM = async (districtId: string, dmUid: string | null) => {
        await assignDM(districtId, dmUid);
        setDistricts(prev => prev.map(d => d.id === districtId ? { ...d, dmUid: dmUid || undefined } : d));
    };

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const allTaskDefs = [...dailyTasks, ...weeklyTasks, ...monthlyTasks];
            const timingMap: Record<string, { durations: number[]; taskTitle: string; estimated: number }> = {};
            allTaskDefs.forEach(t => { timingMap[t.id] = { durations: [], taskTitle: t.title, estimated: t.estimatedMinutes || 10 }; });

            const gmUsers = users.filter(u => u.role === 'gm' || u.role === 'trainer');
            const today = toLocalDateString();
            const now = new Date();
            const dayOfWeek = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            const weekKey = `W-${toLocalDateString(monday)}`;
            const monthKey = `M-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            for (const gm of gmUsers) {
                for (const period of [today, weekKey, monthKey]) {
                    try {
                        const snap = await getDoc(doc(db, 'users', gm.uid, 'taskCompletions', period));
                        if (snap.exists()) {
                            const completions = (snap.data()?.completions || {}) as Record<string, { durationSeconds?: number }>;
                            Object.entries(completions).forEach(([taskId, c]) => {
                                if (c?.durationSeconds && timingMap[taskId]) {
                                    timingMap[taskId].durations.push(c.durationSeconds);
                                }
                            });
                        }
                    } catch { }
                }
            }
            setTaskTimings(timingMap);
        } catch (err) { console.warn('Analytics load failed:', err); }
        setAnalyticsLoading(false);
    };

    if (!user) return <AppShell><PageSkeleton /></AppShell>;

    if (!isAdmin) {
        return (
            <AppShell>
                <div className="card p-8 text-center mt-12">
                    <Shield size={40} className="mx-auto mb-4 text-red-accent" />
                    <h2 className="text-xl font-bold text-navy-dark mb-2">Access Denied</h2>
                    <p className="text-gray-400 text-sm">Only the system administrator can access this page.</p>
                </div>
            </AppShell>
        );
    }

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.store.toLowerCase().includes(search.toLowerCase())
    );
    const dmUsers = users.filter(u => u.role === 'dm');
    const gmCount = users.filter(u => u.role === 'gm').length;

    return (
        <AppShell>
            <div className="space-y-5 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-bold text-navy-dark">🛡️ Admin Panel</h1>
                    <p className="text-sm text-gray-400">Manage users, stores, and districts</p>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-gray-50 rounded-xl p-1 overflow-x-auto">
                    {(['users', 'stores', 'districts', 'analytics'] as Tab[]).map(t => (
                        <button key={t} onClick={async () => {
                            setTab(t);
                            if (t === 'analytics' && Object.keys(taskTimings).length === 0) await loadAnalytics();
                        }} className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all capitalize whitespace-nowrap ${tab === t ? 'bg-white text-navy-dark shadow-sm' : 'text-gray-400'}`}>
                            {t === 'users' ? 'Users' : t === 'stores' ? 'Stores' : t === 'districts' ? 'Districts' : '⏱ Timing'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="card p-8 text-center text-gray-400">Loading...</div>
                ) : tab === 'users' ? (
                    /* ==================== USERS TAB ==================== */
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="card p-4 text-center">
                                <p className="text-2xl font-bold text-navy-dark">{users.length}</p>
                                <p className="text-[10px] text-gray-400">Total</p>
                            </div>
                            <div className="card p-4 text-center">
                                <p className="text-2xl font-bold text-green">{gmCount}</p>
                                <p className="text-[10px] text-gray-400">GMs</p>
                            </div>
                            <div className="card p-4 text-center">
                                <p className="text-2xl font-bold text-blue-info">{dmUsers.length}</p>
                                <p className="text-[10px] text-gray-400">DMs</p>
                            </div>
                        </div>

                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or store..." className="search-input" />
                        </div>

                        {confirmAction && (
                            <div className="card p-5 border-2 border-yellow/30 bg-yellow-light/10 animate-fade-in">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={20} className="text-yellow flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-navy-dark">
                                            {confirmAction.newRole === 'dm' ? 'Promote to District Manager?' : 'Revoke DM access?'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {confirmAction.newRole === 'dm'
                                                ? 'This user will gain DM access. Assign them a district below.'
                                                : 'This user will lose DM access and revert to GM.'}
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => handleChangeRole(confirmAction.uid, confirmAction.newRole)} disabled={actionLoading}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${confirmAction.newRole === 'dm' ? 'bg-blue-info hover:bg-blue-info/80' : 'bg-red-accent hover:bg-red-hover'}`}>
                                                {actionLoading ? 'Updating...' : 'Confirm'}
                                            </button>
                                            <button onClick={() => setConfirmAction(null)} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {filtered.map(u => (
                                <div key={u.uid} className="card px-5 py-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                        style={{ background: u.role === 'dm' ? 'var(--blue-info-light)' : 'var(--gray-50)', color: u.role === 'dm' ? 'var(--blue-info)' : 'var(--navy-dark)' }}>
                                        {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-navy-dark text-[15px] truncate">{u.name}</p>
                                            {u.uid === SUPER_ADMIN_UID && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-accent text-white">ADMIN</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">{u.store || 'No store'} · {u.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${u.role === 'dm' ? 'bg-blue-info/10 text-blue-info' : 'bg-green-light text-green'}`}>
                                            {u.role === 'dm' ? 'DM' : 'GM'}
                                        </span>
                                        {u.uid !== SUPER_ADMIN_UID && (
                                            <button onClick={() => setConfirmAction({ uid: u.uid, newRole: u.role === 'dm' ? 'gm' : 'dm' })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.role === 'dm'
                                                    ? 'bg-gray-100 text-gray-500 hover:bg-red-alert-light hover:text-red-accent'
                                                    : 'bg-blue-info/10 text-blue-info hover:bg-blue-info/20'}`}>
                                                {u.role === 'dm' ? '↓ Demote' : '↑ Promote'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && <div className="card p-8 text-center text-gray-400 text-sm">No users match</div>}
                        </div>
                    </div>
                ) : tab === 'stores' ? (
                    /* ==================== STORES TAB ==================== */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">{stores.length} store{stores.length !== 1 ? 's' : ''} registered</p>
                            <button onClick={() => setShowAddStore(!showAddStore)} className="btn btn-primary text-sm py-2 px-3">
                                <Plus size={16} /> Add Store
                            </button>
                        </div>

                        {showAddStore && (
                            <div className="card p-4 space-y-3 animate-fade-in">
                                <input value={newStoreName} onChange={e => setNewStoreName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddStore()}
                                    placeholder="e.g. Store #101 — Portland" className="search-input" style={{ paddingLeft: 12 }} autoFocus />
                                <div className="flex gap-2">
                                    <button onClick={handleAddStore} className="btn btn-primary text-sm py-2">Add</button>
                                    <button onClick={() => { setShowAddStore(false); setNewStoreName(''); }} className="btn btn-outline text-sm py-2"><X size={14} /></button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {stores.map(s => {
                                const district = districts.find(d => d.id === s.districtId);
                                const gmInStore = users.filter(u => u.storeId === s.id).length;
                                return (
                                    <div key={s.id} className="card px-5 py-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-light flex items-center justify-center flex-shrink-0">
                                            <Store size={18} className="text-green" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-navy-dark text-[15px] truncate">{s.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {district ? `📍 ${district.name}` : '⚠️ No district'}
                                                {gmInStore > 0 && ` · ${gmInStore} GM${gmInStore > 1 ? 's' : ''}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <select value={s.districtId || ''} onChange={e => handleAssignStoreToDistrict(s.id, e.target.value || null)}
                                                className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-navy-dark focus:outline-none focus:border-navy">
                                                <option value="">No District</option>
                                                {districts.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                                            </select>
                                            <button onClick={() => handleDeleteStore(s.id)} className="text-gray-300 hover:text-red-accent transition-colors p-1" title="Delete store">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {stores.length === 0 && (
                                <div className="card p-8 text-center">
                                    <Store size={32} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-400 text-sm">No stores yet. Add your first store above.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : tab === 'districts' ? (
                    /* ==================== DISTRICTS TAB ==================== */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">{districts.length} district{districts.length !== 1 ? 's' : ''}</p>
                            <button onClick={() => setShowAddDistrict(!showAddDistrict)} className="btn btn-primary text-sm py-2 px-3">
                                <Plus size={16} /> Add District
                            </button>
                        </div>

                        {showAddDistrict && (
                            <div className="card p-4 space-y-3 animate-fade-in">
                                <input value={newDistrictName} onChange={e => setNewDistrictName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddDistrict()}
                                    placeholder="e.g. Northwest District" className="search-input" style={{ paddingLeft: 12 }} autoFocus />
                                <div className="flex gap-2">
                                    <button onClick={handleAddDistrict} className="btn btn-primary text-sm py-2">Add</button>
                                    <button onClick={() => { setShowAddDistrict(false); setNewDistrictName(''); }} className="btn btn-outline text-sm py-2"><X size={14} /></button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {districts.map(d => {
                                const dm = users.find(u => u.uid === d.dmUid);
                                const districtStores = stores.filter(s => s.districtId === d.id);
                                const isExpanded = expandedDistrict === d.id;
                                return (
                                    <div key={d.id} className="card overflow-hidden">
                                        <div onClick={() => setExpandedDistrict(isExpanded ? null : d.id)}
                                            className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-blue-info/10 flex items-center justify-center flex-shrink-0">
                                                <MapPin size={18} className="text-blue-info" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-navy-dark text-[15px]">{d.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    {dm ? `👤 ${dm.name}` : '⚠️ No DM assigned'} · {districtStores.length} store{districtStores.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteDistrict(d.id); }} className="text-gray-300 hover:text-red-accent transition-colors p-1" title="Delete district">
                                                    <Trash2 size={14} />
                                                </button>
                                                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4 animate-fade-in">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Assigned DM</p>
                                                    <select value={d.dmUid || ''} onChange={e => handleAssignDM(d.id, e.target.value || null)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-navy-dark focus:outline-none focus:border-navy">
                                                        <option value="">— No DM —</option>
                                                        {dmUsers.map(u => (<option key={u.uid} value={u.uid}>{u.name} ({u.email})</option>))}
                                                    </select>
                                                    {dmUsers.length === 0 && (
                                                        <p className="text-xs text-yellow mt-1">⚠️ No DMs exist yet. Promote a GM in the Users tab first.</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stores in this District</p>
                                                    {districtStores.length > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {districtStores.map(s => {
                                                                const gmInStore = users.filter(u => u.storeId === s.id);
                                                                return (
                                                                    <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                                                                        <div className="flex items-center gap-2">
                                                                            <Store size={14} className="text-green" />
                                                                            <span className="text-sm text-navy-dark">{s.name}</span>
                                                                            {gmInStore.length > 0 && (
                                                                                <span className="text-[10px] text-gray-400">({gmInStore.map(g => g.name.split(' ')[0]).join(', ')})</span>
                                                                            )}
                                                                        </div>
                                                                        <button onClick={() => handleAssignStoreToDistrict(s.id, null)}
                                                                            className="text-xs text-gray-400 hover:text-red-accent transition-colors">
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400">No stores assigned. Go to the Stores tab to assign stores to this district.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {districts.length === 0 && (
                                <div className="card p-8 text-center">
                                    <MapPin size={32} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-400 text-sm">No districts yet. Create one to organize your stores.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ==================== ANALYTICS TAB ==================== */
                    <div className="space-y-4">
                        <div className="card p-4 bg-blue-info-light/20 border border-blue-info/10">
                            <p className="text-xs text-navy-dark">
                                <strong>⏱ Task Timing Analytics</strong> — Passive timing compares estimated vs. actual average time per task.
                            </p>
                        </div>

                        {analyticsLoading ? (
                            <div className="card p-8 text-center text-gray-400">Loading timing data...</div>
                        ) : (() => {
                            const tasksWithData = Object.entries(taskTimings)
                                .filter(([, v]) => v.durations.length > 0)
                                .map(([id, v]) => {
                                    const avg = Math.round(v.durations.reduce((a, b) => a + b, 0) / v.durations.length);
                                    const avgMin = Math.round(avg / 60);
                                    const variance = v.estimated > 0 ? Math.round(((avgMin - v.estimated) / v.estimated) * 100) : 0;
                                    return { id, title: v.taskTitle, estimated: v.estimated, avgMin, variance, count: v.durations.length };
                                })
                                .sort((a, b) => b.variance - a.variance);

                            return tasksWithData.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <Clock size={32} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-400 text-sm">No timing data yet. As GMs complete tasks, average times will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tasksWithData.map(t => (
                                        <div key={t.id} className="card px-5 py-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-navy-dark text-[14px] flex-1 min-w-0 truncate">{t.title}</p>
                                                <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{t.count} sample{t.count !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-400">Est:</span>
                                                    <span className="font-semibold text-navy-dark">{t.estimated}m</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-400">Avg:</span>
                                                    <span className={`font-semibold ${t.variance > 30 ? 'text-red-accent' : t.variance < -10 ? 'text-green' : 'text-navy-dark'}`}>{t.avgMin}m</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${t.variance > 30 ? 'bg-red-alert-light text-red-accent' : t.variance > 0 ? 'bg-yellow-light text-yellow' : 'bg-green-light text-green'}`}>
                                                    {t.variance > 0 ? '+' : ''}{t.variance}%
                                                </span>
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all" style={{
                                                        width: `${Math.min(100, Math.round((t.avgMin / Math.max(t.estimated, t.avgMin)) * 100))}%`,
                                                        background: t.variance > 30 ? 'var(--red-accent)' : t.variance > 0 ? 'var(--yellow)' : 'var(--green)',
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
