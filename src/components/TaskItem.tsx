'use client';

import React, { useState } from 'react';
import { TaskDefinition } from '@/data/tasks';
import { TaskCompletion } from '@/lib/tasks';
import { getTimeWindowLabel } from '@/lib/timeWindows';
import {
    Check, ChevronDown, ChevronUp, Clock, ExternalLink, StickyNote,
    Lightbulb, ListChecks, UserCheck, X, Users2,
} from 'lucide-react';

type TabType = 'daily' | 'weekly' | 'monthly';

interface TaskItemProps {
    task: TaskDefinition;
    category: TabType;
    isCompleted: boolean;
    onToggle: () => void;
    completion: TaskCompletion | null;
    onUpdateNotes: (notes: string) => void;
    onDelegate: (name: string) => void;
    onUndelegate: () => void;
    onVerify: () => void;
    isCurrentWindow: boolean;
}

export default function TaskItem({ task, category, isCompleted, onToggle, completion, onUpdateNotes, onDelegate, onUndelegate, onVerify, isCurrentWindow }: TaskItemProps) {
    const [expanded, setExpanded] = useState(false);
    const [notes, setNotes] = useState(completion?.notes || '');
    const [showDelegateInput, setShowDelegateInput] = useState(false);
    const [delegateName, setDelegateName] = useState('');
    const [justCompleted, setJustCompleted] = useState(false);
    const [showNudge, setShowNudge] = useState(false);

    const handleNotesBlur = () => {
        if (completion) onUpdateNotes(notes);
    };

    const handleDelegate = () => {
        if (delegateName.trim()) {
            onDelegate(delegateName.trim());
            setDelegateName('');
            setShowDelegateInput(false);
        }
    };

    const handleToggle = () => {
        if (!isCompleted) {
            setJustCompleted(true);
            setTimeout(() => setJustCompleted(false), 600);
        }
        onToggle();
    };

    const isDelegated = completion?.isDelegated;
    const isPendingFollowUp = isDelegated && completion?.followUpStatus !== 'verified';
    const isVerified = isDelegated && completion?.followUpStatus === 'verified';

    const cardClass = justCompleted ? 'task-just-completed' : '';
    const borderClass = isPendingFollowUp
        ? 'border-yellow/30 bg-yellow-light/10'
        : isVerified
            ? 'border-green/30 bg-green-light/10'
            : isCompleted
                ? 'border-green/30 bg-green-light/10'
                : isCurrentWindow && !isCompleted
                    ? 'border-red-accent/20 ring-1 ring-red-accent/10'
                    : '';

    return (
        <div className={`card overflow-hidden transition-all duration-200 ${cardClass} ${borderClass}`}>
            <div className="flex items-start gap-3 px-4 py-4">
                {isPendingFollowUp ? (
                    <div className="task-checkbox mt-0.5 bg-yellow/10 border-yellow/40" title="Awaiting follow-up">
                        <Clock size={12} className="text-yellow" />
                    </div>
                ) : (
                    <button onClick={handleToggle} className={`task-checkbox mt-0.5 ${isCompleted ? 'checked' : ''}`}>
                        {isCompleted && <Check size={14} className="text-white" strokeWidth={3} />}
                    </button>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-medium text-[15px] ${isCompleted ? 'text-gray-400 line-through' : 'text-navy-dark'}`}>
                            {task.title}
                        </h3>
                        {task.timeWindow && category === 'daily' && !isCompleted && !isPendingFollowUp && (
                            <span className={`time-badge ${isCurrentWindow ? 'time-badge-now' : 'time-badge-upcoming'}`}>
                                {getTimeWindowLabel(task.timeWindow)}
                            </span>
                        )}
                        {isCompleted && completion && !isDelegated && (
                            <span className="badge badge-green text-[10px]">
                                <Clock size={10} />
                                {new Date(completion.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        {isPendingFollowUp && completion?.delegatedTo && (
                            <span className="badge badge-yellow text-[10px]">
                                <UserCheck size={10} />
                                Delegated to {completion.delegatedTo} · Follow Up
                            </span>
                        )}
                        {isVerified && completion?.delegatedTo && (
                            <span className="badge badge-green text-[10px]">
                                <Check size={10} />
                                {completion.delegatedTo} — Verified ✓
                            </span>
                        )}
                    </div>
                    <p className={`text-sm mt-0.5 ${isCompleted ? 'text-gray-300' : 'text-gray-400'}`}>
                        {task.description}
                    </p>

                    {isPendingFollowUp && (
                        <div className="flex items-center gap-2 mt-2.5">
                            <button onClick={onVerify}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green text-white text-xs font-semibold hover:bg-green/90 transition-colors shadow-sm">
                                <Check size={12} strokeWidth={3} /> Verify Completed
                            </button>
                            <button onClick={onUndelegate}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-colors">
                                <X size={12} /> Cancel Delegation
                            </button>
                        </div>
                    )}

                    {showNudge && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-blue-info/10 border border-blue-info/20 animate-fade-in">
                            <p className="text-xs text-blue-info font-medium">💡 Could someone else have done this? Delegating develops your team and frees your time.</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {!isCompleted && !isDelegated && (
                        <button onClick={() => setShowDelegateInput(!showDelegateInput)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-navy hover:bg-navy/5 transition-colors" title="Delegate task">
                            <Users2 size={16} />
                        </button>
                    )}
                    <button onClick={() => setExpanded(!expanded)} className="text-gray-300 hover:text-navy p-1 transition-colors">
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {showDelegateInput && !isDelegated && (
                <div className="flex items-center gap-2 px-4 pb-3 animate-fade-in">
                    <input type="text" value={delegateName} onChange={e => setDelegateName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleDelegate()}
                        placeholder="Delegate to (e.g. Sarah — Asst. Mgr)"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 placeholder:text-gray-300"
                        autoFocus />
                    <button onClick={handleDelegate} className="btn btn-primary text-xs px-3 py-2">Assign</button>
                    <button onClick={() => { setShowDelegateInput(false); setDelegateName(''); }} className="text-gray-300 hover:text-gray-500 p-1">
                        <X size={16} />
                    </button>
                </div>
            )}

            {expanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4 animate-fade-in">
                    {task.subTasks.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-gray-500">
                                <ListChecks size={14} />
                                <span className="text-xs font-semibold uppercase tracking-wide">Sub-Tasks</span>
                            </div>
                            <ul className="space-y-1.5">
                                {task.subTasks.map(st => (
                                    <li key={st.id} className="flex items-center gap-2 text-sm text-gray-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 flex-shrink-0" />
                                        {st.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {task.tips && (
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-yellow-light/30 border border-yellow/20">
                            <Lightbulb size={14} className="text-yellow mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-600">{task.tips}</p>
                        </div>
                    )}

                    {task.resourceLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {task.resourceLinks.map(link => (
                                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-info-light/50 text-blue-info text-xs font-medium hover:bg-blue-info-light transition-colors">
                                    <ExternalLink size={12} /> {link.label}
                                </a>
                            ))}
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <StickyNote size={14} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Notes</span>
                        </div>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={handleNotesBlur}
                            placeholder="Add notes..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-100 text-sm resize-none min-h-[60px] focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 text-gray-600 placeholder:text-gray-300"
                            rows={2} />
                    </div>
                </div>
            )}
        </div>
    );
}
