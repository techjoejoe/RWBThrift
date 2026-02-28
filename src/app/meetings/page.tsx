'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { toLocalDateString } from '@/lib/tasks';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AppShell from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/Skeletons';
import { FileText, ChevronDown, ChevronUp, Save, CheckCircle2 } from 'lucide-react';

interface AgendaTemplate {
    id: string;
    title: string;
    emoji: string;
    duration: string;
    sections: { heading: string; items: string[]; editable?: boolean }[];
}

const templates: AgendaTemplate[] = [
    {
        id: 'huddle', title: 'Team Huddle', emoji: '🤝', duration: '10-15 min',
        sections: [
            { heading: 'Yesterday\'s Results', items: ['Sales vs. goal', 'Production output', 'Key wins'] },
            { heading: 'Today\'s Priorities', items: ['Top 3 priorities', 'Special events or promotions', 'Coverage gaps'] },
            { heading: 'Assignments', items: ['Who owns what today', 'Follow-up items from yesterday'] },
            { heading: 'Notes', items: [''], editable: true },
        ],
    },
    {
        id: 'one-on-one', title: '1:1 Meeting', emoji: '👤', duration: '20-30 min',
        sections: [
            { heading: 'Check-In', items: ['How are you doing?', 'What\'s going well?', 'What\'s been challenging?'] },
            { heading: 'Performance Review', items: ['Progress on goals', 'Areas of strength', 'Development opportunities'] },
            { heading: 'Support Needed', items: ['What do you need from me?', 'Resources or training?', 'Obstacles to remove'] },
            { heading: 'Development Plan', items: ['Next skill to develop', 'Timeline', 'How I\'ll support you'] },
            { heading: 'Notes', items: [''], editable: true },
        ],
    },
    {
        id: 'weekly-review', title: 'Weekly Business Review', emoji: '📊', duration: '30-45 min',
        sections: [
            { heading: 'Sales Performance', items: ['Weekly sales vs. LY', 'Daily sales trend', 'Top/bottom departments'] },
            { heading: 'Production', items: ['Units produced vs. goal', 'Rag out execution', 'Production staffing'] },
            { heading: 'Labor', items: ['Labor % vs. budget', 'OT hours', 'Scheduling effectiveness'] },
            { heading: 'Action Items', items: ['What to start doing', 'What to stop doing', 'What to continue'] },
            { heading: 'Notes', items: [''], editable: true },
        ],
    },
    {
        id: 'safety-meeting', title: 'Safety Meeting', emoji: '⛑️', duration: '15-20 min',
        sections: [
            { heading: 'Incident Review', items: ['Any incidents since last meeting?', 'Open claims status', 'Near misses'] },
            { heading: 'Walkthrough Findings', items: ['Hazards identified', 'Equipment issues', 'Housekeeping concerns'] },
            { heading: 'Training Topic', items: ['This week\'s safety topic', 'Demo or walkthrough', 'Q&A'] },
            { heading: 'Action Items', items: ['Fixes needed', 'Who owns them', 'Due date'] },
            { heading: 'Notes', items: [''], editable: true },
        ],
    },
];

export default function MeetingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();
    const [expanded, setExpanded] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState<string | null>(null);

    React.useEffect(() => { if (!loading && !isAuthenticated) router.replace('/login'); }, [loading, isAuthenticated, router]);

    const saveNotes = useCallback(async (templateId: string) => {
        if (!user) return;
        const today = toLocalDateString();
        try {
            await setDoc(doc(db, 'users', user.uid, 'meetingNotes', `${templateId}-${today}`), {
                templateId, date: today, notes: notes[templateId] || '', savedAt: new Date().toISOString(),
            });
            setSaved(templateId);
            setTimeout(() => setSaved(null), 2000);
        } catch (err) { console.warn('Save failed:', err); }
    }, [user, notes]);

    if (loading || !user) return null;

    return (
        <AppShell>
            <div className="space-y-5 animate-slide-up">
                <h1 className="text-2xl font-bold text-navy-dark">📋 Meeting Templates</h1>
                <p className="text-sm text-gray-400">Structured agendas for your most important meetings. Tap to expand, add notes, and save.</p>

                <div className="space-y-3">
                    {templates.map(t => (
                        <div key={t.id} className="card overflow-hidden">
                            <button
                                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{t.emoji}</span>
                                    <div>
                                        <h3 className="font-semibold text-navy-dark">{t.title}</h3>
                                        <p className="text-xs text-gray-400">{t.duration}</p>
                                    </div>
                                </div>
                                {expanded === t.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                            </button>

                            {expanded === t.id && (
                                <div className="px-5 pb-5 space-y-4 animate-fade-in">
                                    {t.sections.map((section, i) => (
                                        <div key={i}>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{section.heading}</h4>
                                            {section.editable ? (
                                                <textarea
                                                    value={notes[t.id] || ''}
                                                    onChange={e => setNotes({ ...notes, [t.id]: e.target.value })}
                                                    placeholder="Type your notes here..."
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy-dark resize-none focus:outline-none focus:border-navy bg-gray-50"
                                                    rows={3}
                                                />
                                            ) : (
                                                <ul className="space-y-1.5">
                                                    {section.items.map((item, j) => (
                                                        <li key={j} className="flex items-start gap-2 text-sm text-gray-500">
                                                            <span className="text-gray-300 mt-0.5">•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => saveNotes(t.id)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light transition-colors"
                                    >
                                        {saved === t.id ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Notes</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
