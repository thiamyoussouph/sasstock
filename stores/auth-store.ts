'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Company {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    signatureUrl?: string;
    stampUrl?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string | null;
    permissions: string[];
    companyId: string;
    company: Company;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    hydrated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    setHydrated: () => void; // ✅ méthode pour forcer hydrated à true
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            loading: false,
            error: null,
            hydrated: false,

            login: async (email, password) => {
                set({ loading: true, error: null });

                try {
                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await res.json();

                    if (!res.ok) throw new Error(data.message || 'Erreur de connexion');

                    set({
                        user: data.user,
                        token: data.token,
                        loading: false,
                        error: null,
                    });
                } catch (err: any) {
                    set({ error: err.message, loading: false });
                }
            },

            logout: () => {
                localStorage.removeItem('auth-storage');
                set({ user: null, token: null });
                window.location.href = '/';
            },

            setUser: (user) => set({ user }),

            setHydrated: () => set({ hydrated: true }), // ✅
        }),
        {
            name: 'auth-storage',
            // ✅ méthode qui sera appelée après rehydratation
            onRehydrateStorage: () => (state) => {
                state?.setHydrated?.(); // appel de la méthode définie
            },
        }
    )
);
