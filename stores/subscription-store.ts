'use client';

import { create } from 'zustand';
import {
    SubscriptionWithRelations,
    CreateSubscriptionPayload,
} from '@/types/subscription';

type SubscriptionFilters = {
    companyId?: string;
    planId?: string;
    // status?: string; ❌ retiré car plus utilisé dans l'API
    startDate?: string;
    endDate?: string;
};

interface SubscriptionStore {
    subscriptions: SubscriptionWithRelations[];
    loading: boolean;
    submitting: boolean;
    error: string | null;
    page: number;
    totalPages: number;
    totalItems: number;
    filters: SubscriptionFilters;

    setFilters: (filters: SubscriptionFilters) => void;
    setPage: (page: number) => void;

    fetchSubscriptions: () => Promise<void>;
    createSubscription: (data: CreateSubscriptionPayload) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
    subscriptions: [],
    loading: false,
    submitting: false,
    error: null,
    page: 1,
    totalPages: 1,
    totalItems: 0,
    filters: {},

    setFilters: (filters) => set({ filters, page: 1 }),
    setPage: (page) => set({ page }),

    fetchSubscriptions: async () => {
        const { page, filters } = get();
        set({ loading: true, error: null });

        const params = new URLSearchParams();

        params.append('page', page.toString());
        if (filters.companyId) params.append('companyId', filters.companyId);
        if (filters.planId) params.append('planId', filters.planId);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        try {
            const res = await fetch(`/api/subscriptions?${params.toString()}`);
            if (!res.ok) throw new Error('Erreur API');
            const data = await res.json();

            set({
                subscriptions: data.data,
                totalItems: data.totalItems,
                totalPages: data.totalPages,
                loading: false,
            });
        } catch (err: any) {
            set({ error: err.message || 'Erreur de chargement', loading: false });
        }
    },

    createSubscription: async (payload) => {
        set({ submitting: true, error: null });
        try {
            const res = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erreur lors de la création');
            }

            const { subscription } = await res.json();

            set((state) => ({
                subscriptions: [subscription, ...state.subscriptions],
                submitting: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Erreur création', submitting: false });
        }
    },
}));
