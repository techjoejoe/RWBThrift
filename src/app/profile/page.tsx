'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, roleLabels } from '@/lib/auth';
import { useTasks } from '@/lib/tasks';
import { dailyTasks, weeklyTasks, monthlyTasks } from '@/data/tasks';
import AppShell from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/Skeletons';
import PhotoUpload from '@/components/PhotoUpload';
import { sendPasswordResetEmail, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
    LogOut, Store, Shield, Flame, BarChart3, Camera, Check,
    Pencil, Mail, Lock, Save, X, AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const { user, firebaseUser, logout, isAuthenticated, updateProfile, loading } = useAuth();
    const { getCompletionCount, getStreak } = useTasks();
    const [photoSaved, setPhotoSaved] = useState(false);

    // Editable fields
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [nameSaved, setNameSaved] = useState(false);

    // Email change
    const [editingEmail, setEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [emailStatus, setEmailStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [emailError, setEmailError] = useState('');

    // Password reset
    const [passwordStatus, setPasswordStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    useEffect(() => {
        if (!isAuthenticated) router.replace('/login');
    }, [isAuthenticated, router]);

    if (loading || !user) return null;

    const streak = getStreak();
    const dailyDone = getCompletionCount(dailyTasks.map(t => t.id), 'daily');
    const weeklyDone = getCompletionCount(weeklyTasks.map(t => t.id), 'weekly');
    const monthlyDone = getCompletionCount(monthlyTasks.map(t => t.id), 'monthly');

    const handleLogout = () => { logout(); router.replace('/login'); };

    const handlePhotoChange = async (url: string) => {
        await updateProfile({ photoURL: url || undefined });
        setPhotoSaved(true);
        setTimeout(() => setPhotoSaved(false), 2000);
    };

    const handleNameSave = async () => {
        if (!newName.trim() || newName.trim() === user.name) {
            setEditingName(false);
            return;
        }
        await updateProfile({ name: newName.trim() });
        setEditingName(false);
        setNameSaved(true);
        setTimeout(() => setNameSaved(false), 2000);
    };

    const handlePasswordReset = async () => {
        if (!firebaseUser?.email) return;
        setPasswordStatus('sending');
        try {
            await sendPasswordResetEmail(auth, firebaseUser.email);
            setPasswordStatus('sent');
            setTimeout(() => setPasswordStatus('idle'), 5000);
        } catch {
            setPasswordStatus('error');
            setTimeout(() => setPasswordStatus('idle'), 3000);
        }
    };

    const handleEmailChange = async () => {
        if (!newEmail.trim() || !emailPassword || !firebaseUser) return;
        setEmailStatus('saving');
        setEmailError('');
        try {
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(firebaseUser.email!, emailPassword);
            await reauthenticateWithCredential(firebaseUser, credential);
            // Update email
            await updateEmail(firebaseUser, newEmail.trim());
            setEmailStatus('success');
            setEditingEmail(false);
            setNewEmail('');
            setEmailPassword('');
            setTimeout(() => setEmailStatus('idle'), 3000);
        } catch (err: unknown) {
            setEmailStatus('error');
            const msg = err instanceof Error ? err.message : 'Failed to update email';
            if (msg.includes('wrong-password')) setEmailError('Incorrect password');
            else if (msg.includes('invalid-email')) setEmailError('Invalid email address');
            else if (msg.includes('email-already-in-use')) setEmailError('Email already in use');
            else setEmailError('Failed — try again');
        }
    };

    return (
        <AppShell>
            <div className="space-y-6 animate-slide-up max-w-lg mx-auto">
                <h1 className="text-2xl font-bold text-navy-dark">Profile</h1>

                {/* User Card */}
                <div className="card p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <PhotoUpload
                            currentPhoto={user.photoURL}
                            name={user.name || 'GM'}
                            size={96}
                            onPhotoChange={handlePhotoChange}
                        />
                    </div>

                    {!user.photoURL && (
                        <div className="flex items-center justify-center gap-2 mb-3 text-xs text-blue-info bg-blue-info-light/30 px-3 py-2 rounded-lg">
                            <Camera size={14} />
                            <span>Tap your avatar to add a profile photo</span>
                        </div>
                    )}

                    {photoSaved && (
                        <div className="flex items-center justify-center gap-2 mb-3 text-xs text-green bg-green-light/20 px-3 py-2 rounded-lg animate-fade-in">
                            <Check size={14} />
                            <span>Photo saved!</span>
                        </div>
                    )}

                    {/* Editable Name */}
                    {editingName ? (
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-center text-lg font-bold text-navy-dark focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 w-52"
                                autoFocus
                            />
                            <button onClick={handleNameSave} className="p-2 rounded-lg bg-green text-white hover:bg-green/90 transition-colors">
                                <Save size={16} />
                            </button>
                            <button onClick={() => setEditingName(false)} className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-navy-dark">{user.name}</h2>
                            <button
                                onClick={() => { setNewName(user.name); setEditingName(true); }}
                                className="p-1 rounded-md text-gray-300 hover:text-navy hover:bg-navy/5 transition-colors"
                                title="Edit name"
                            >
                                <Pencil size={14} />
                            </button>
                        </div>
                    )}

                    {nameSaved && (
                        <div className="flex items-center justify-center gap-2 mb-2 text-xs text-green animate-fade-in">
                            <Check size={12} /> Name updated!
                        </div>
                    )}

                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                        <Shield size={14} />
                        {roleLabels[user.role]}
                    </p>
                    {user.store && (
                        <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mt-1">
                            <Store size={14} />
                            {user.store}
                        </p>
                    )}
                    {user.isOnboarding && (
                        <span className="badge badge-blue mt-3 mx-auto">📚 Onboarding — Day {user.onboardingDay || 1}/20</span>
                    )}
                </div>

                {/* Account Settings */}
                <div className="card p-5 space-y-4">
                    <h3 className="font-semibold text-navy-dark text-[15px]">Account Settings</h3>

                    {/* Email */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail size={14} />
                                <span>{firebaseUser?.email || user.email}</span>
                            </div>
                            {!editingEmail && (
                                <button
                                    onClick={() => setEditingEmail(true)}
                                    className="text-xs font-medium text-navy hover:text-navy-light transition-colors"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        {editingEmail && (
                            <div className="space-y-2 p-3 rounded-xl bg-gray-50 animate-fade-in">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    placeholder="New email address"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 placeholder:text-gray-300"
                                    autoFocus
                                />
                                <input
                                    type="password"
                                    value={emailPassword}
                                    onChange={e => setEmailPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleEmailChange()}
                                    placeholder="Current password (required)"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 placeholder:text-gray-300"
                                />
                                {emailError && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-accent">
                                        <AlertCircle size={12} /> {emailError}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEmailChange}
                                        disabled={emailStatus === 'saving'}
                                        className="btn btn-primary text-xs px-3 py-2 flex-1 disabled:opacity-50"
                                    >
                                        {emailStatus === 'saving' ? 'Updating...' : 'Update Email'}
                                    </button>
                                    <button
                                        onClick={() => { setEditingEmail(false); setNewEmail(''); setEmailPassword(''); setEmailError(''); }}
                                        className="btn btn-outline text-xs px-3 py-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {emailStatus === 'success' && (
                            <div className="flex items-center gap-1.5 text-xs text-green animate-fade-in">
                                <Check size={12} /> Email updated successfully!
                            </div>
                        )}
                    </div>

                    {/* Password Reset */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Lock size={14} />
                            <span>Password</span>
                        </div>
                        <button
                            onClick={handlePasswordReset}
                            disabled={passwordStatus === 'sending'}
                            className="text-xs font-medium text-navy hover:text-navy-light transition-colors disabled:opacity-50"
                        >
                            {passwordStatus === 'idle' && 'Send Reset Email'}
                            {passwordStatus === 'sending' && 'Sending...'}
                            {passwordStatus === 'sent' && '✓ Email Sent!'}
                            {passwordStatus === 'error' && 'Failed — Try Again'}
                        </button>
                    </div>

                    {passwordStatus === 'sent' && (
                        <div className="text-xs text-green bg-green-light/20 px-3 py-2 rounded-lg animate-fade-in">
                            A password reset link has been sent to <strong>{firebaseUser?.email}</strong>. Check your inbox.
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="card p-5 space-y-4">
                    <h3 className="font-semibold text-navy-dark flex items-center gap-2"><BarChart3 size={18} /> Today&apos;s Stats</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-navy-dark">{dailyDone}/{dailyTasks.length}</p>
                            <p className="text-xs text-gray-400">Daily</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-navy-dark">{weeklyDone}/{weeklyTasks.length}</p>
                            <p className="text-xs text-gray-400">Weekly</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-navy-dark">{monthlyDone}/{monthlyTasks.length}</p>
                            <p className="text-xs text-gray-400">Monthly</p>
                        </div>
                    </div>
                    {streak > 0 && (
                        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
                            <Flame size={18} className="text-yellow" />
                            <span className="text-sm font-semibold text-navy-dark">{streak}-day completion streak!</span>
                        </div>
                    )}
                </div>

                {/* Sign Out */}
                <button onClick={handleLogout} className="btn btn-outline w-full text-red-accent border-red-accent/20 hover:bg-red-alert-light hover:border-red-accent">
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </AppShell>
    );
}
