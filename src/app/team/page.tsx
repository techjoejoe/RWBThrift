'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTasks } from '@/lib/tasks';
import { dailyTasks, weeklyTasks, monthlyTasks } from '@/data/tasks';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AppShell from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/Skeletons';
import { UserPlus, Trash2, X, ChevronDown, ChevronUp, Check, Users, AlertTriangle, Repeat } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    skills: string[];
    hireDate?: string;
}

const SKILL_OPTIONS = [
    'Register', 'Cash Handling', 'Opening', 'Closing', 'MOD',
    'Production Sorting', 'Pricing', 'Rag Out', 'Receiving',
    'Floor Recovery', 'Merchandising', 'Customer Service Lead',
    'Safety Captain', 'Training', 'Scheduling', 'Forklift',
];

const allTaskDefs = [...dailyTasks, ...weeklyTasks, ...monthlyTasks];

export default function TeamPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();
    const { getAllCompletions } = useTasks();
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [tab, setTab] = useState<'roster' | 'delegation'>('roster');

    useEffect(() => { if (!isAuthenticated) router.replace('/login'); }, [isAuthenticated, router]);

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, 'users', user.uid, 'storeData', 'team'), snap => {
            if (snap.exists()) setTeam(snap.data().members || []);
        });
        return unsub;
    }, [user]);

    const saveTeam = useCallback(async (members: TeamMember[]) => {
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid, 'storeData', 'team'), { members, updatedAt: new Date().toISOString() });
    }, [user]);

    const addMember = () => {
        if (!newName.trim()) return;
        const member: TeamMember = { id: Date.now().toString(), name: newName.trim(), role: newRole.trim() || 'Team Member', skills: [] };
        const updated = [...team, member];
        setTeam(updated);
        saveTeam(updated);
        setNewName(''); setNewRole(''); setShowAdd(false);
    };

    const removeMember = (id: string) => {
        const updated = team.filter(m => m.id !== id);
        setTeam(updated);
        saveTeam(updated);
    };

    const toggleSkill = (memberId: string, skill: string) => {
        const updated = team.map(m => {
            if (m.id !== memberId) return m;
            const skills = m.skills.includes(skill) ? m.skills.filter(s => s !== skill) : [...m.skills, skill];
            return { ...m, skills };
        });
        setTeam(updated);
        saveTeam(updated);
    };

    if (loading || !user) return null;

    // Build delegation stats from current completions
    const dailyCompletions = getAllCompletions('daily');
    const weeklyCompletions = getAllCompletions('weekly');
    const monthlyCompletions = getAllCompletions('monthly');
    const allCompletions = { ...dailyCompletions, ...weeklyCompletions, ...monthlyCompletions };

    // Aggregate by person
    const delegationByPerson: Record<string, { tasks: Record<string, number>; total: number }> = {};
    Object.entries(allCompletions).forEach(([taskId, completion]) => {
        const c = completion as unknown as Record<string, unknown>;
        if (c?.delegatedTo) {
            const name = c.delegatedTo as string;
            if (!delegationByPerson[name]) delegationByPerson[name] = { tasks: {}, total: 0 };
            const taskDef = allTaskDefs.find(t => t.id === taskId);
            const taskLabel = taskDef?.title || taskId;
            delegationByPerson[name].tasks[taskLabel] = (delegationByPerson[name].tasks[taskLabel] || 0) + 1;
            delegationByPerson[name].total += 1;
        }
    });

    const delegateList = Object.entries(delegationByPerson)
        .map(([name, data]) => ({
            name,
            total: data.total,
            tasks: Object.entries(data.tasks).sort((a, b) => b[1] - a[1]),
            topTask: Object.entries(data.tasks).sort((a, b) => b[1] - a[1])[0],
        }))
        .sort((a, b) => b.total - a.total);

    // Skill coverage matrix
    const skillCoverage = SKILL_OPTIONS.map(skill => ({
        skill,
        count: team.filter(m => m.skills.includes(skill)).length,
    }));

    return (
        <AppShell>
            <div className="space-y-5 animate-slide-up">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-navy-dark">👥 Team</h1>
                    {tab === 'roster' && (
                        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary text-sm py-2 px-3">
                            <UserPlus size={16} /> Add
                        </button>
                    )}
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-gray-50 rounded-xl p-1">
                    <button onClick={() => setTab('roster')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'roster' ? 'bg-white text-navy-dark shadow-sm' : 'text-gray-400'}`}>
                        Roster & Skills
                    </button>
                    <button onClick={() => setTab('delegation')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'delegation' ? 'bg-white text-navy-dark shadow-sm' : 'text-gray-400'}`}>
                        Delegation Tracker
                    </button>
                </div>

                {tab === 'roster' ? (
                    <>
                        {/* Add Member */}
                        {showAdd && (
                            <div className="card p-4 space-y-3 animate-fade-in">
                                <div className="flex gap-2">
                                    <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" className="search-input flex-1" style={{ paddingLeft: 12 }} />
                                    <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role (optional)" className="search-input flex-1" style={{ paddingLeft: 12 }} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={addMember} className="btn btn-primary text-sm py-2">Add Member</button>
                                    <button onClick={() => setShowAdd(false)} className="btn btn-outline text-sm py-2"><X size={14} /></button>
                                </div>
                            </div>
                        )}

                        {/* Team List */}
                        <div className="space-y-3">
                            {team.length === 0 && (
                                <div className="card p-8 text-center">
                                    <Users size={32} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-400 text-sm">No team members yet. Add your team to start tracking skills.</p>
                                </div>
                            )}
                            {team.map(member => (
                                <div key={member.id} className="card overflow-hidden">
                                    <div
                                        onClick={() => setExpanded(expanded === member.id ? null : member.id)}
                                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-bold text-navy">
                                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-navy-dark text-[15px]">{member.name}</h3>
                                                <p className="text-xs text-gray-400">{member.role} · {member.skills.length} skills</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); removeMember(member.id); }} className="text-gray-300 hover:text-red-accent transition-colors p-1">
                                                <Trash2 size={14} />
                                            </button>
                                            {expanded === member.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                        </div>
                                    </div>
                                    {expanded === member.id && (
                                        <div className="px-5 pb-5 animate-fade-in">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Skills & Certifications</p>
                                            <div className="flex flex-wrap gap-2">
                                                {SKILL_OPTIONS.map(skill => {
                                                    const has = member.skills.includes(skill);
                                                    return (
                                                        <button key={skill} onClick={() => toggleSkill(member.id, skill)}
                                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${has ? 'bg-green text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                        >
                                                            {has && <Check size={10} className="inline mr-1" />}{skill}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Skill Coverage Matrix */}
                        {team.length > 0 && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-navy-dark mb-3">🎯 Skill Coverage Matrix</h3>
                                <p className="text-xs text-gray-400 mb-3">How many team members are trained on each skill. Red = gap, Yellow = limited, Green = covered.</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {skillCoverage.map(({ skill, count }) => (
                                        <div key={skill} className={`p-2 rounded-lg text-center text-[11px] font-medium ${count === 0 ? 'bg-red-alert-light text-red-accent' : count === 1 ? 'bg-yellow-light text-yellow' : 'bg-green-light text-green'}`} title={`${count} team member${count !== 1 ? 's' : ''} trained`}>
                                            <p className="font-bold text-sm">{count}</p>
                                            <p className="truncate">{skill}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Delegation Tracker Tab */
                    <div className="space-y-4">
                        <div className="card p-4 bg-blue-info-light/20 border border-blue-info/10">
                            <p className="text-xs text-navy-dark"><strong>Delegation Tracker</strong> — See which tasks are assigned to each person. Spot patterns and diversify assignments to support development.</p>
                        </div>

                        {delegateList.length === 0 ? (
                            <div className="card p-8 text-center">
                                <Repeat size={32} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-400 text-sm">No delegated tasks yet. When you delegate tasks, they&apos;ll appear here grouped by person.</p>
                            </div>
                        ) : (
                            delegateList.map(person => {
                                const topTaskCount = person.topTask ? person.topTask[1] : 0;
                                const isRepeat = topTaskCount >= 2;
                                return (
                                    <div key={person.name} className="card overflow-hidden">
                                        <div className="px-5 py-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-info/10 flex items-center justify-center text-sm font-bold text-blue-info">
                                                        {person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-navy-dark text-[15px]">{person.name}</h3>
                                                        <p className="text-xs text-gray-400">{person.total} task{person.total !== 1 ? 's' : ''} delegated</p>
                                                    </div>
                                                </div>
                                                {isRepeat && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-light text-yellow text-[10px] font-semibold">
                                                        <AlertTriangle size={10} /> Same task ×{topTaskCount}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Task breakdown */}
                                            <div className="space-y-1.5">
                                                {person.tasks.map(([task, count]) => (
                                                    <div key={task} className="flex items-center gap-2">
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <div className="h-2 rounded-full bg-blue-info/20 flex-1 max-w-[120px]">
                                                                <div className="h-full rounded-full bg-blue-info" style={{ width: `${(count / person.total) * 100}%` }} />
                                                            </div>
                                                            <span className="text-xs text-navy-dark truncate">{task}</span>
                                                        </div>
                                                        <span className={`text-[11px] font-bold min-w-[18px] text-right ${count >= 2 ? 'text-yellow' : 'text-gray-400'}`}>
                                                            ×{count}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Suggestion if repeat pattern */}
                                            {isRepeat && person.topTask && (
                                                <div className="mt-3 px-3 py-2 rounded-lg bg-yellow-light/30 border border-yellow/20">
                                                    <p className="text-[11px] text-navy-dark">
                                                        💡 <strong>{person.name.split(' ')[0]}</strong> keeps getting <strong>{person.topTask[0]}</strong>. Consider assigning a different task to broaden their experience.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
