'use client';

import { create } from 'zustand';
import { Plan, CreatePlanPayload, UpdatePlanPayload } from '@/types/plan';

interface PlanStore {
    plans: Plan[];
    loading: boolean;
    error: string | null;
    fetchPlans: () => Promise<void>;
    createPlan: (data: CreatePlanPayload) => Promise<void>;
    updatePlan: (data: UpdatePlanPayload) => Promise<void>;
    deletePlan: (id: string) => Promise<void>;
}

export const usePlanStore = create<PlanStore>((set) => ({
    plans: [],
    loading: false,
    error: null,

    async fetchPlans() {
        set({ loading: true });
        try {
            const res = await fetch('/api/plans');
            const data = await res.json();
            set({ plans: data, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Erreur chargement', loading: false });
        }
    },

    async createPlan(data) {
        try {
            const res = await fetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const created = await res.json();
            set((state) => ({ plans: [...state.plans, created] }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async updatePlan({ id, ...data }) {
        try {
            const res = await fetch(`/api/plans/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const updated = await res.json();
            set((state) => ({
                plans: state.plans.map((p) => (p.id === id ? updated : p))
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async deletePlan(id) {
        try {
            await fetch(`/api/plans/${id}`, { method: 'DELETE' });
            set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },
}));
