'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getStores } from '@/lib/services/stores';
import { Shield, ChevronRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';



export default function LoginPage() {
    const router = useRouter();
    const { login, signup, isAuthenticated, loading: authLoading } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role] = useState('gm' as const);
    const [store, setStore] = useState('');
    const [storeId, setStoreId] = useState('');
    const [storeOptions, setStoreOptions] = useState<{ id: string; name: string }[]>([]);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    // Fetch stores for dropdown via service layer
    useEffect(() => {
        const loadStores = async () => {
            try {
                const stores = await getStores();
                setStoreOptions(stores.map(s => ({ id: s.id, name: s.name })));
            } catch { }
        };
        loadStores();
    }, []);

    // Navigate after auth state is confirmed (avoids the "blank dashboard" bug)
    useEffect(() => {
        if (!authLoading && isAuthenticated) router.replace('/dashboard');
    }, [authLoading, isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                if (!name.trim()) { setError('Name is required.'); setLoading(false); return; }
                await signup(email, password, {
                    name: name.trim(),
                    role,
                    isOnboarding: role === 'gm' && isOnboarding,
                    store,
                    storeId: storeId || undefined,
                    onboardingDay: isOnboarding ? 1 : undefined,
                });
            } else {
                await login(email, password);
            }
            // Don't navigate here — the useEffect below handles it
            // once onAuthStateChanged confirms the user is set
        } catch (err: unknown) {
            const firebaseError = err as { code?: string; message?: string };
            switch (firebaseError.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-credential':
                    setError('Invalid email or password.');
                    break;
                case 'auth/email-already-in-use':
                    setError('An account with this email already exists.');
                    break;
                case 'auth/weak-password':
                    setError('Password must be at least 6 characters.');
                    break;
                case 'auth/invalid-email':
                    setError('Please enter a valid email address.');
                    break;
                default:
                    setError(firebaseError.message || 'Something went wrong. Please try again.');
            }
            setLoading(false); // Only reset on ERROR — on success, stay loading until useEffect navigates
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Enter your email address first, then click Forgot Password.');
            return;
        }
        setResetLoading(true);
        setError('');
        setResetSent(false);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            setResetSent(true);
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/invalid-email') {
                setError('No account found with that email.');
            } else {
                setError('Failed to send reset email. Try again.');
            }
        }
        setResetLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0F1B33 0%, #1B2A4A 50%, #2A3F6A 100%)' }}>
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(196,30,58,0.15) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-150px] left-[-80px] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(42,63,106,0.3) 0%, transparent 70%)' }} />
            </div>

            <div className="w-full max-w-md animate-scale-in relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-accent mb-4 shadow-lg" style={{ boxShadow: '0 8px 32px rgba(196,30,58,0.3)' }}>
                        <Shield size={32} className="text-white" />
                    </div>
                    <h1 className="text-white text-2xl font-bold">GM Command Center</h1>
                    <p className="text-white/50 text-sm mt-1">Red White & Blue Thrift Store</p>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="card p-8 space-y-5" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}>
                    {/* Toggle */}
                    <div className="flex bg-gray-50 rounded-xl p-1">
                        <button type="button" onClick={() => { setIsSignUp(false); setError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isSignUp ? 'bg-white text-navy-dark shadow-sm' : 'text-gray-400'}`}>
                            Sign In
                        </button>
                        <button type="button" onClick={() => { setIsSignUp(true); setError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isSignUp ? 'bg-white text-navy-dark shadow-sm' : 'text-gray-400'}`}>
                            Sign Up
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 rounded-xl bg-red-alert-light border border-red-accent/20 text-red-accent text-sm font-medium animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Sign Up: Name */}
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-semibold text-navy-dark mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="search-input"
                                style={{ paddingLeft: '16px' }}
                                required
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-navy-dark mb-2">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@rwbthrift.com"
                                className="search-input"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-navy-dark mb-2">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={isSignUp ? 'Create a password (6+ characters)' : 'Enter your password'}
                                className="search-input pr-12"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password — only on sign in */}
                    {!isSignUp && (
                        <div className="text-right -mt-2">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={resetLoading}
                                className="text-xs font-medium text-navy/60 hover:text-red-accent transition-colors disabled:opacity-50"
                            >
                                {resetLoading ? 'Sending...' : 'Forgot Password?'}
                            </button>
                        </div>
                    )}

                    {/* Reset Email Sent */}
                    {resetSent && (
                        <div className="px-4 py-3 rounded-xl bg-green-light/30 border border-green/20 text-green text-sm font-medium animate-fade-in">
                            ✓ Password reset email sent! Check your inbox.
                        </div>
                    )}

                    {/* Sign Up: Role is always GM */}
                    {isSignUp && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-navy-dark mb-2">Your Store</label>
                                {storeOptions.length > 0 ? (
                                    <select
                                        value={storeId}
                                        onChange={e => {
                                            const selected = storeOptions.find(s => s.id === e.target.value);
                                            setStoreId(e.target.value);
                                            setStore(selected?.name || '');
                                        }}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-navy-dark focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 appearance-none"
                                        required
                                    >
                                        <option value="">Select your store...</option>
                                        {storeOptions.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={store}
                                        onChange={e => setStore(e.target.value)}
                                        placeholder="e.g. Store #101 — Portland"
                                        className="search-input"
                                        style={{ paddingLeft: '16px' }}
                                        required
                                    />
                                )}
                            </div>

                            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isOnboarding}
                                    onChange={e => setIsOnboarding(e.target.checked)}
                                    className="w-5 h-5 rounded-md accent-red-accent"
                                />
                                <div>
                                    <span className="text-sm font-medium text-navy-dark">I&apos;m a New GM (Onboarding)</span>
                                    <p className="text-xs text-gray-400 mt-0.5">Enable the 20-day training checklist</p>
                                </div>
                            </label>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full text-base py-3.5 mt-2 group disabled:opacity-60"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isSignUp ? 'Create Account' : 'Sign In'}
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-300 mt-3">
                        &ldquo;Lead the Business, Don&apos;t React to It.&rdquo;
                    </p>
                </form>
            </div>
        </div>
    );
}
