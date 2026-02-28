'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'gm' | 'trainer' | 'dm' | 'admin';

export interface User {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    isOnboarding: boolean;
    store: string;
    storeId?: string;
    onboardingDay?: number;
    photoURL?: string;
}

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, profile: Omit<User, 'uid' | 'email'>) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<Pick<User, 'name' | 'photoURL' | 'store' | 'storeId'>>) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
    login: async () => { },
    signup: async () => { },
    logout: async () => { },
    updateProfile: async () => { },
    isAuthenticated: false,
});

// Capitalize each word in a name: 'joe smith' → 'Joe Smith'
function capitalizeName(name: string): string {
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Cache the pending profile in memory so signup -> onAuthStateChanged can use it
let pendingProfile: Omit<User, 'uid' | 'email'> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const userRef = useRef<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety timeout: if auth doesn't resolve in 5s, stop loading
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            clearTimeout(timeout);
            if (fbUser) {
                setFirebaseUser(fbUser);

                // Set user IMMEDIATELY with basic Firebase Auth info
                // so isAuthenticated becomes true right away (no waiting on Firestore)
                const basicProfile: User = {
                    uid: fbUser.uid,
                    email: fbUser.email || '',
                    name: capitalizeName(pendingProfile?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User'),
                    role: pendingProfile?.role || 'gm',
                    isOnboarding: pendingProfile?.isOnboarding || false,
                    store: pendingProfile?.store || '',
                    storeId: pendingProfile?.storeId,
                    onboardingDay: pendingProfile?.onboardingDay,
                };
                setUser(basicProfile);
                setLoading(false);

                // Then fetch full profile from Firestore and update
                try {
                    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUser({
                            uid: fbUser.uid,
                            email: fbUser.email || '',
                            name: capitalizeName(data.name || basicProfile.name),
                            role: data.role || basicProfile.role,
                            isOnboarding: data.isOnboarding || false,
                            store: data.store || '',
                            storeId: data.storeId || undefined,
                            onboardingDay: data.onboardingDay,
                            photoURL: data.photoURL || undefined,
                        });
                    } else if (pendingProfile) {
                        // New signup — write profile to Firestore
                        try {
                            await setDoc(doc(db, 'users', fbUser.uid), {
                                name: pendingProfile.name,
                                role: pendingProfile.role,
                                isOnboarding: pendingProfile.isOnboarding,
                                store: pendingProfile.store,
                                storeId: pendingProfile.storeId || null,
                                onboardingDay: pendingProfile.onboardingDay || (pendingProfile.isOnboarding ? 1 : null),
                                createdAt: new Date().toISOString(),
                            });
                        } catch (writeErr) {
                            console.warn('Firestore profile write failed:', writeErr);
                        }
                    }
                } catch (err) {
                    console.warn('Firestore read failed (check security rules):', err);
                }
                pendingProfile = null;
            } else {
                setFirebaseUser(null);
                setUser(null);
                setLoading(false);
            }
        });

        return () => { clearTimeout(timeout); unsubscribe(); };
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email: string, password: string, profile: Omit<User, 'uid' | 'email'>) => {
        pendingProfile = profile;
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        try {
            await setDoc(doc(db, 'users', cred.user.uid), {
                name: profile.name,
                role: profile.role,
                isOnboarding: profile.isOnboarding,
                store: profile.store,
                storeId: profile.storeId || null,
                onboardingDay: profile.onboardingDay || (profile.isOnboarding ? 1 : null),
                createdAt: new Date().toISOString(),
            });
        } catch (err) {
            console.warn('Firestore profile write failed:', err);
        }
    };

    // Keep ref in sync with latest user
    useEffect(() => { userRef.current = user; }, [user]);

    const updateProfile = useCallback(async (data: Partial<Pick<User, 'name' | 'photoURL' | 'store'>>) => {
        const current = userRef.current;
        if (!current) return;
        const updated = { ...current, ...data };
        setUser(updated);

        try {
            await setDoc(doc(db, 'users', current.uid), data, { merge: true });
        } catch (err) {
            console.warn('Profile update failed:', err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logout = useCallback(async () => {
        // Navigate away FIRST so no component renders with null user
        window.location.href = '/login';
        await signOut(auth);
    }, []);

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, login, signup, logout, updateProfile, isAuthenticated: !!user }}>
            {loading && (
                <div className="fixed inset-0 z-[9999] min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0F1B33 0%, #1B2A4A 50%, #2A3F6A 100%)' }}>
                    <div className="text-center">
                        <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white/60 text-sm">Loading...</p>
                    </div>
                </div>
            )}
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

export const roleLabels: Record<UserRole, string> = {
    gm: 'General Manager',
    trainer: 'Trainer / Manager',
    dm: 'District Manager',
    admin: 'L&D Admin',
};
