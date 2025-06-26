'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Modèle Company simplifié (reprend les infos nécessaires à l'affichage)
interface Company {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    signatureUrl?: string;
    stampUrl?: string;
}

// User étendu avec la relation à la company
interface User {
    id: string;
    name: string;
    email: string;
    role: string | null;
    permissions: string[];
    companyId: string;
    company: Company; // <= ici
}

interface AuthStore {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            loading: false,
            error: null,

            login: async (email: string, password: string) => {
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
                        user: data.user, // `data.user.company` doit être présent dans la réponse
                        token: data.token,
                        loading: false,
                        error: null,
                    });
                } catch (err: any) {
                    set({ error: err.message, loading: false });
                }
            },

            logout: () => {
                set({ user: null, token: null });
            },

            setUser: (user) => set({ user }),
        }),
        {
            name: 'auth-storage',
        }
    )
);

