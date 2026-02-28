'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { toLocalDateString } from '@/lib/tasks';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AppShell from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/Skeletons';
import { ClipboardCheck, CheckCircle2, XCircle, MinusCircle, Save, RotateCcw } from 'lucide-react';

interface ChecklistItem {
    id: string;
    category: string;
    text: string;
}

const visitChecklist: ChecklistItem[] = [
    { id: 'v1', category: 'Exterior & Entrance', text: 'Parking lot clean and free of debris' },
    { id: 'v2', category: 'Exterior & Entrance', text: 'Signage lit and visible from road' },
    { id: 'v3', category: 'Exterior & Entrance', text: 'Donation door area clean and organized' },
    { id: 'v4', category: 'Exterior & Entrance', text: 'Shopping carts available and in good condition' },
    { id: 'v5', category: 'Sales Floor', text: 'Floors clean, no hazards or wet spots' },
    { id: 'v6', category: 'Sales Floor', text: 'Racks organized, properly spaced' },
    { id: 'v7', category: 'Sales Floor', text: 'Department signage accurate and visible' },
    { id: 'v8', category: 'Sales Floor', text: 'Endcaps merchandised and full' },
    { id: 'v9', category: 'Sales Floor', text: 'Color tag sale signage current and correct' },
    { id: 'v10', category: 'Sales Floor', text: 'Fitting rooms clean and monitored' },
    { id: 'v11', category: 'Cash Wrap', text: 'Registers operational and staffed' },
    { id: 'v12', category: 'Cash Wrap', text: 'Cashier-to-customer ratio maintained (3:1 basket rule)' },
    { id: 'v13', category: 'Cash Wrap', text: 'Counter clean and organized' },
    { id: 'v14', category: 'Production', text: 'Production area clean and organized' },
    { id: 'v15', category: 'Production', text: 'Rag out plan current and being executed' },
    { id: 'v16', category: 'Production', text: 'Sorting area not backed up' },
    { id: 'v17', category: 'Production', text: 'Pricing consistent with guidelines' },
    { id: 'v18', category: 'Safety', text: 'Emergency exits clear and marked' },
    { id: 'v19', category: 'Safety', text: 'Fire extinguishers accessible and inspected' },
    { id: 'v20', category: 'Safety', text: 'First aid kit stocked and accessible' },
    { id: 'v21', category: 'Safety', text: 'No exposed wiring or broken fixtures' },
    { id: 'v22', category: 'Team', text: 'Team in dress code with name badges' },
    { id: 'v23', category: 'Team', text: 'MOD coverage confirmed' },
    { id: 'v24', category: 'Team', text: 'Huddle conducted today' },
    { id: 'v25', category: 'Team', text: 'Schedule posted and accurate' },
];

type Rating = 'pass' | 'fail' | 'na';

export default function StoreVisitPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();
    const [ratings, setRatings] = useState<Record<string, Rating>>({});
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    React.useEffect(() => { if (!loading && !isAuthenticated) router.replace('/login'); }, [loading, isAuthenticated, router]);

    const setRating = (id: string, r: Rating) => {
        setRatings(prev => {
            const next = { ...prev };
            if (next[id] === r) { delete next[id]; } else { next[id] = r; }
            return next;
        });
    };

    const reset = () => { setRatings({}); setSaved(false); };

    const saveVisit = useCallback(async () => {
        if (!user) return;
        setSaving(true);
        const today = toLocalDateString();
        try {
            await setDoc(doc(db, 'users', user.uid, 'storeVisits', today), {
                date: today, ratings, savedAt: new Date().toISOString(),
                score: { pass: Object.values(ratings).filter(r => r === 'pass').length, fail: Object.values(ratings).filter(r => r === 'fail').length, na: Object.values(ratings).filter(r => r === 'na').length },
            });
            setSaved(true);
        } catch (err) { console.warn('Save failed:', err); }
        setSaving(false);
    }, [user, ratings]);

    if (loading || !user) return null;

    const categories = [...new Set(visitChecklist.map(c => c.category))];
    const passCount = Object.values(ratings).filter(r => r === 'pass').length;
    const failCount = Object.values(ratings).filter(r => r === 'fail').length;
    const naCount = Object.values(ratings).filter(r => r === 'na').length;
    const ratedCount = passCount + failCount;
    const scorePct = ratedCount > 0 ? Math.round((passCount / ratedCount) * 100) : 0;

    return (
        <AppShell>
            <div className="space-y-5 animate-slide-up">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-navy-dark">🏪 Store Visit Checklist</h1>
                    <button onClick={reset} className="text-xs text-gray-400 hover:text-navy flex items-center gap-1"><RotateCcw size={12} /> Reset</button>
                </div>

                {/* Score Banner */}
                {ratedCount > 0 && (
                    <div className={`card p-4 flex items-center justify-between ${scorePct >= 90 ? 'border-green/20 bg-green-light/20' : scorePct >= 70 ? 'border-yellow/20 bg-yellow-light/20' : 'border-red-accent/20 bg-red-alert-light'}`}>
                        <div>
                            <p className="text-sm font-semibold text-navy-dark">Visit Score</p>
                            <p className="text-xs text-gray-400">{passCount} pass · {failCount} fail · {naCount} N/A</p>
                        </div>
                        <p className={`text-3xl font-bold ${scorePct >= 90 ? 'text-green' : scorePct >= 70 ? 'text-yellow' : 'text-red-accent'}`}>{scorePct}%</p>
                    </div>
                )}

                {/* Checklist by Category */}
                {categories.map(cat => (
                    <div key={cat} className="card p-5">
                        <h3 className="font-semibold text-navy-dark mb-3">{cat}</h3>
                        <div className="space-y-2">
                            {visitChecklist.filter(c => c.category === cat).map(item => (
                                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                    <p className="flex-1 text-sm text-gray-500">{item.text}</p>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setRating(item.id, 'pass')} className={`p-1.5 rounded-lg transition-colors ${ratings[item.id] === 'pass' ? 'bg-green text-white' : 'text-gray-300 hover:text-green hover:bg-green-light/20'}`} title="Pass">
                                            <CheckCircle2 size={16} />
                                        </button>
                                        <button onClick={() => setRating(item.id, 'fail')} className={`p-1.5 rounded-lg transition-colors ${ratings[item.id] === 'fail' ? 'bg-red-accent text-white' : 'text-gray-300 hover:text-red-accent hover:bg-red-alert-light'}`} title="Fail">
                                            <XCircle size={16} />
                                        </button>
                                        <button onClick={() => setRating(item.id, 'na')} className={`p-1.5 rounded-lg transition-colors ${ratings[item.id] === 'na' ? 'bg-gray-400 text-white' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'}`} title="N/A">
                                            <MinusCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Save */}
                <button
                    onClick={saveVisit} disabled={saving || ratedCount === 0}
                    className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${saved ? 'bg-green text-white' : 'bg-navy text-white hover:bg-navy-light'} ${ratedCount === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    {saved ? <><CheckCircle2 size={16} /> Visit Saved!</> : <><Save size={16} /> {saving ? 'Saving...' : 'Save Visit Results'}</>}
                </button>
            </div>
        </AppShell>
    );
}
