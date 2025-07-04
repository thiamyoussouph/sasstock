'use client';

import { CreateUserPayload, UpdateUserPayload, UserWithRole } from '@/types/user';
import { create } from 'zustand';

interface UserStore {
    users: UserWithRole[];
    loading: boolean;
    error: string | null;
    fetchUsers: (companyId: string) => Promise<void>;
    createUser: (data: CreateUserPayload) => Promise<void>;
    updateUser: (data: UpdateUserPayload) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    users: [],
    loading: false,
    error: null,

    fetchUsers: async (companyId) => {
        set({ loading: true });
        try {
            const res = await fetch(`/api/users/company/${companyId}`);
            const data = await res.json();
            set({ users: data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    createUser: async (payload) => {
        try {
            const res = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const newUser = await res.json();
            set((state) => ({ users: [newUser, ...state.users] }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    updateUser: async (payload) => {
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const updatedUser = await res.json();
            set((state) => ({
                users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },
}));
