'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { resources, categoryLabels, ResourceCategory } from '@/data/resources';
import AppShell from '@/components/layout/AppShell';
import {
    Search, Star, ExternalLink, Monitor, Users, GraduationCap, Phone,
    Clock, Mail, Calendar, MessageSquare, Cloud, FileText, Headphones,
    Shield, Camera, Wrench, BarChart3, Layers, Truck, BookOpen, Map,
    Award, TrendingUp, HelpCircle, Lightbulb, Video, Lock, UserPlus,
    Heart, DollarSign, User,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
    Clock: <Clock size={18} />, Mail: <Mail size={18} />, Calendar: <Calendar size={18} />,
    MessageSquare: <MessageSquare size={18} />, Cloud: <Cloud size={18} />, FileText: <FileText size={18} />,
    Headphones: <Headphones size={18} />, Shield: <Shield size={18} />, Camera: <Camera size={18} />,
    Wrench: <Wrench size={18} />, BarChart3: <BarChart3 size={18} />, Layers: <Layers size={18} />,
    Truck: <Truck size={18} />, BookOpen: <BookOpen size={18} />, Map: <Map size={18} />,
    Award: <Award size={18} />, GraduationCap: <GraduationCap size={18} />, TrendingUp: <TrendingUp size={18} />,
    HelpCircle: <HelpCircle size={18} />, Lightbulb: <Lightbulb size={18} />, Video: <Video size={18} />,
    Lock: <Lock size={18} />, UserPlus: <UserPlus size={18} />, Heart: <Heart size={18} />,
    DollarSign: <DollarSign size={18} />, User: <User size={18} />, Users: <Users size={18} />,
    Monitor: <Monitor size={18} />, Phone: <Phone size={18} />,
    Laptop: <Monitor size={18} />, ClipboardCheck: <FileText size={18} />, ShieldCheck: <Shield size={18} />,
    Presentation: <FileText size={18} />,
};

const categoryIcons: Record<ResourceCategory, React.ReactNode> = {
    systems: <Monitor size={16} />,
    hr: <Users size={16} />,
    training: <GraduationCap size={16} />,
    contacts: <Phone size={16} />,
};

export default function ResourcesPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isAuthenticated) router.replace('/login');
    }, [isAuthenticated, router]);

    // Listen to Firestore for favorites
    useEffect(() => {
        if (!user) return;
        const docRef = doc(db, 'users', user.uid, 'preferences', 'favorites');
        const unsub = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setFavorites(new Set(snap.data().ids || []));
            }
        }, (err) => {
            console.warn('Firestore favorites listener error:', err.message);
        });
        return () => unsub();
    }, [user]);

    const toggleFavorite = async (id: string) => {
        const next = new Set(favorites);
        if (next.has(id)) next.delete(id); else next.add(id);
        setFavorites(next);
        if (user) {
            const docRef = doc(db, 'users', user.uid, 'preferences', 'favorites');
            await setDoc(docRef, { ids: [...next] });
        }
    };

    const filtered = useMemo(() => {
        let list = resources;
        if (activeCategory !== 'all') list = list.filter(r => r.category === activeCategory);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
        }
        // Sort favorites first
        return [...list].sort((a, b) => {
            const af = favorites.has(a.id) ? 0 : 1;
            const bf = favorites.has(b.id) ? 0 : 1;
            return af - bf;
        });
    }, [search, activeCategory, favorites]);

    const categories: (ResourceCategory | 'all')[] = ['all', 'systems', 'hr', 'training', 'contacts'];

    return (
        <AppShell>
            <div className="space-y-5 animate-slide-up">
                <h1 className="text-2xl font-bold text-navy-dark">Resource Hub</h1>

                {/* Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources..."
                        className="search-input"
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-navy text-white shadow-sm'
                                : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            {cat !== 'all' && categoryIcons[cat]}
                            {cat === 'all' ? 'All Resources' : categoryLabels[cat]}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                <p className="text-sm text-gray-400">{filtered.length} resource{filtered.length !== 1 ? 's' : ''}</p>

                {/* Resource Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                    {filtered.map(resource => (
                        <div
                            key={resource.id}
                            className="card card-interactive p-4 flex items-start gap-3 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 group-hover:bg-navy/5 group-hover:text-navy transition-colors">
                                {iconMap[resource.icon] || <FileText size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-navy-dark text-sm truncate">{resource.title}</h3>
                                    <button onClick={() => toggleFavorite(resource.id)} className="flex-shrink-0">
                                        <Star size={14} className={favorites.has(resource.id) ? 'text-yellow fill-yellow' : 'text-gray-200 hover:text-yellow'} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{resource.description}</p>
                            </div>
                            {resource.url !== '#' && (
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-200 hover:text-navy transition-colors flex-shrink-0 mt-1"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="card p-8 text-center">
                        <p className="text-gray-400">No resources found. Try a different search term.</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
