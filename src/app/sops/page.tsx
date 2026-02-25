'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import { Search, ChevronDown, ChevronUp, ExternalLink, BookOpen } from 'lucide-react';

interface SOPItem {
    id: string;
    title: string;
    category: string;
    content: string[];
    links?: { label: string; url: string }[];
}

const sops: SOPItem[] = [
    {
        id: 'cash-handling', title: 'Cash Handling Procedures', category: 'Cash & Finance',
        content: [
            'All cash transactions must be performed under camera — no exceptions.',
            'Till drops should be done every 2 hours or when till exceeds $200.',
            'Two-person rule: always have a witness when counting cash or making safe drops.',
            'Change orders must be documented in the change order log with date, amount, and initials.',
            'End-of-day deposits: count in the safe room under camera, complete deposit slip, seal in bank bag.',
            'Never leave cash unattended on a counter or register.',
        ],
    },
    {
        id: 'opening', title: 'Store Opening Procedures', category: 'Operations',
        content: [
            'Arrive 30 minutes before opening to walk the store.',
            'Disable alarm, turn on lights, check HVAC.',
            'Review overnight voicemails and emails for urgent items.',
            'Walk the sales floor: check recovery from previous close, restock endcaps.',
            'Count and verify opening tills — sign off on each register.',
            'Brief the team on daily priorities before doors open.',
            'Unlock doors at exactly the posted opening time.',
        ],
    },
    {
        id: 'closing', title: 'Store Closing Procedures', category: 'Operations',
        content: [
            'Begin closing recovery 1 hour before close.',
            'Make "last call" announcement 15 minutes before close.',
            'Close all registers, count tills, complete deposit.',
            'Walk entire store: check all exits, restrooms, back rooms.',
            'Set close-to-open expectations note for morning team.',
            'Set alarm, lock all doors, verify all exits secured.',
            'Check exterior: signage off, parking lot clear.',
        ],
    },
    {
        id: 'safety', title: 'Safety & Emergency Procedures', category: 'Safety',
        content: [
            'Know all emergency exit locations and assembly points.',
            'Fire: pull alarm, evacuate, call 911, account for all staff.',
            'Medical: call 911, apply first aid if trained, complete incident report.',
            'Active threat: Run-Hide-Fight protocol. Do not confront.',
            'Wet floors: immediately place caution signs, clean within 5 minutes.',
            'Lifting: bend at knees, not waist. Max individual lift: 50 lbs.',
            'Report ALL incidents in Origami within 24 hours — no exceptions.',
        ],
        links: [{ label: 'Origami', url: 'https://live.origamirisk.com/Origami/Account/Login' }],
    },
    {
        id: 'hiring', title: 'Hiring & Onboarding', category: 'HR',
        content: [
            'All positions must be posted in Dayforce before interviewing.',
            'Use structured interview questions — same questions for all candidates.',
            'Background checks required for all hires before start date.',
            'New hire orientation: Day 1 covers safety, policies, tour. No register access until trained.',
            'Buddy system: assign new hires a trained team member for first 2 weeks.',
            'Complete all Dayforce entries within 48 hours of hire.',
        ],
        links: [{ label: 'Dayforce', url: 'https://www.dayforcehcm.com/' }],
    },
    {
        id: 'production', title: 'Production Floor Standards', category: 'Production',
        content: [
            'Sort incoming donations within 24 hours of receiving.',
            'Price using the pricing guide — no guessing or freelancing.',
            'Quality check: no stains, tears, missing buttons, or broken zippers on sales floor.',
            'Rag out items that dont sell within the color tag rotation cycle.',
            'Production goal: minimum 300 units per production team member per shift.',
            'Keep production area clean and organized — FIFO for all incoming goods.',
        ],
    },
    {
        id: 'customer-service', title: 'Customer Service Standards', category: 'Retail',
        content: [
            'Greet every customer within 10 seconds of entering.',
            '10-foot rule: acknowledge any customer within 10 feet.',
            'Returns: accept within 7 days with receipt, store credit only.',
            'Complaints: listen fully, empathize, solve. Escalate to MOD if needed.',
            'Never argue with a customer on the sales floor.',
            'The answer is yes — figure out the question. Always err on the side of the customer.',
        ],
    },
    {
        id: 'lp', title: 'Loss Prevention', category: 'Safety',
        content: [
            'Greet everyone — thieves avoid stores where they feel seen.',
            'High-value items: keep in locked cases or behind registers.',
            'Check fitting rooms after each use — count items in and out.',
            'Review Solink alerts weekly — follow up on every flagged event.',
            'Employee theft: document, report to LP team. Do not confront alone.',
            'Shoplifting: observe, report, do NOT chase or physically engage.',
        ],
    },
];

const categories = [...new Set(sops.map(s => s.category))];

export default function SOPsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    React.useEffect(() => { if (!isAuthenticated) router.replace('/login'); }, [isAuthenticated, router]);

    const filtered = sops.filter(s => {
        const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.content.some(c => c.toLowerCase().includes(search.toLowerCase()));
        const matchesCat = !selectedCategory || s.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <AppShell>
            <div className="space-y-5 animate-slide-up">
                <h1 className="text-2xl font-bold text-navy-dark">📄 SOPs & Quick Reference</h1>

                {/* Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search procedures..."
                        className="search-input"
                    />
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelectedCategory(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!selectedCategory ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        All
                    </button>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* SOP List */}
                <div className="space-y-3">
                    {filtered.map(sop => (
                        <div key={sop.id} className="card overflow-hidden">
                            <button
                                onClick={() => setExpanded(expanded === sop.id ? null : sop.id)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen size={18} className="text-navy flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-navy-dark text-[15px]">{sop.title}</h3>
                                        <p className="text-[10px] text-gray-400">{sop.category} • {sop.content.length} steps</p>
                                    </div>
                                </div>
                                {expanded === sop.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                            </button>

                            {expanded === sop.id && (
                                <div className="px-5 pb-5 animate-fade-in">
                                    <ol className="space-y-2">
                                        {sop.content.map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                                                <span className="w-5 h-5 rounded-full bg-navy/10 text-navy text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                    {sop.links && sop.links.length > 0 && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                            {sop.links.map(link => (
                                                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-info hover:underline">
                                                    <ExternalLink size={10} /> {link.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="card p-8 text-center text-gray-400 text-sm">No SOPs match your search</div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
