'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { SUPER_ADMIN_UID } from '@/lib/constants';
import {
    LayoutDashboard,
    ClipboardCheck,
    BookOpen,
    GraduationCap,
    UserCircle,
    Users,
    Settings,
    LogOut,
    Shield,
    BarChart3,
    Sun,
    Moon,
    CalendarDays,
    FileText,
    ClipboardList,
    Store,
    Users2,
    TrendingUp,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[];
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { label: 'Tasks', href: '/tasks', icon: <ClipboardCheck size={22} />, roles: ['gm', 'trainer'] },
    { label: 'History', href: '/history', icon: <CalendarDays size={22} />, roles: ['gm', 'trainer'] },
    { label: 'Meetings', href: '/meetings', icon: <FileText size={22} /> },
    { label: 'SOPs', href: '/sops', icon: <BookOpen size={22} /> },
    { label: 'Store Visit', href: '/store-visit', icon: <Store size={22} />, roles: ['dm'] },
    { label: 'Team', href: '/team', icon: <Users2 size={22} />, roles: ['gm', 'trainer'] },
    { label: 'Resources', href: '/resources', icon: <ClipboardList size={22} /> },
    { label: 'Training', href: '/training', icon: <GraduationCap size={22} />, roles: ['gm', 'trainer'] },
    { label: 'District', href: '/dm-dashboard', icon: <Users size={22} />, roles: ['dm'] },
    { label: 'Admin', href: '/admin', icon: <Settings size={22} />, roles: ['admin'] },
    { label: 'Profile', href: '/profile', icon: <UserCircle size={22} /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const filteredNav = navItems.filter(item => {
        if (!item.roles) return true;
        // Admin page: only super admin
        if (item.href === '/admin') return user?.uid === SUPER_ADMIN_UID;
        // District + Store Visit: DMs + super admin
        if (item.href === '/dm-dashboard' || item.href === '/store-visit') return user?.role === 'dm' || user?.uid === SUPER_ADMIN_UID;
        return user && item.roles.includes(user.role);
    });

    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    useEffect(() => {
        const saved = localStorage.getItem('gm-theme') as 'light' | 'dark' | null;
        if (saved) { setTheme(saved); document.documentElement.setAttribute('data-theme', saved); }
    }, []);
    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        localStorage.setItem('gm-theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    return (
        <div className="flex min-h-screen bg-off-white">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[260px] bg-navy-dark text-white fixed h-full z-50">
                {/* Brand */}
                <div className="px-6 py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-accent flex items-center justify-center">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-[15px] leading-tight">GM Command</h1>
                            <p className="text-[11px] text-white/50 tracking-wide">RED WHITE & BLUE</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {filteredNav.map(item => {
                        const active = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${active
                                    ? 'bg-white/15 text-white shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/8'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                                {active && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-accent" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Footer */}
                {user && (
                    <div className="px-4 py-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-2 mb-3">
                            <div className="w-9 h-9 rounded-full bg-navy-light flex items-center justify-center text-sm font-semibold">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-[11px] text-white/40 capitalize">{user.role === 'gm' ? 'General Manager' : user.role === 'dm' ? 'District Manager' : user.role === 'admin' ? 'L&D Admin' : 'Trainer'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white text-[13px] flex-1 rounded-lg hover:bg-white/8 transition-colors"
                                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                            >
                                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white text-[13px] rounded-lg hover:bg-white/8 transition-colors"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-[260px] pb-[80px] md:pb-6">
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
                <div className="flex items-center justify-around h-[72px] px-2">
                    {filteredNav.slice(0, 5).map(item => {
                        const active = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${active
                                    ? 'text-navy'
                                    : 'text-gray-400'
                                    }`}
                            >
                                <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[10px] font-medium ${active ? 'text-navy font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                                {active && (
                                    <div className="absolute top-0 w-8 h-0.5 bg-red-accent rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
