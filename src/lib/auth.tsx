'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

// Cache the pending profile in memory so signup -> onAuthStateChanged can use it
let pendingProfile: Omit<User, 'uid' | 'email'> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                setFirebaseUser(fbUser);
                let profile: User | null = null;

                // Try to fetch user profile from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        profile = {
                            uid: fbUser.uid,
                            email: fbUser.email || '',
                            name: data.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'GM',
                            role: data.role,
                            isOnboarding: data.isOnboarding || false,
                            store: data.store || '',
                            storeId: data.storeId || undefined,
                            onboardingDay: data.onboardingDay,
                            photoURL: data.photoURL || undefined,
                        };
                    }
                } catch (err) {
                    console.warn('Firestore read failed (check security rules):', err);
                }

                // If Firestore read failed or doc doesn't exist, use pending profile or fallback
                if (!profile && pendingProfile) {
                    profile = {
                        uid: fbUser.uid,
                        email: fbUser.email || '',
                        ...pendingProfile,
                    };
                    // Try to write the profile to Firestore
                    try {
                        await setDoc(doc(db, 'users', fbUser.uid), {
                            name: pendingProfile.name,
                            role: pendingProfile.role,
                            isOnboarding: pendingProfile.isOnboarding,
                            store: pendingProfile.store,
                            onboardingDay: pendingProfile.onboardingDay || null,
                            createdAt: new Date().toISOString(),
                        });
                    } catch (writeErr) {
                        console.warn('Firestore write failed (check security rules):', writeErr);
                    }
                    pendingProfile = null;
                }

                // Last resort fallback
                if (!profile) {
                    profile = {
                        uid: fbUser.uid,
                        email: fbUser.email || '',
                        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                        role: 'gm',
                        isOnboarding: false,
                        store: 'Store #101 — Portland',
                    };
                }

                setUser(profile);
            } else {
                setFirebaseUser(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
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

    const updateProfile = useCallback(async (data: Partial<Pick<User, 'name' | 'photoURL' | 'store'>>) => {
        if (!user) return;
        const updated = { ...user, ...data };
        setUser(updated);

        try {
            await setDoc(doc(db, 'users', user.uid), data, { merge: true });
        } catch (err) {
            console.warn('Profile update failed:', err);
        }
    }, [user]);

    const logout = async () => {
        await signOut(auth);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0F1B33 0%, #1B2A4A 50%, #2A3F6A 100%)' }}>
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, login, signup, logout, updateProfile, isAuthenticated: !!user }}>
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
