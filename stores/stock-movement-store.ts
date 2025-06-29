'use client';

import { create } from 'zustand';
import { CreateStockMovementPayload, StockMovement, UpdateStockMovementPayload } from '@/types/stock-movements';

interface StockMovementStore {
    movements: StockMovement[];
    selectedMovement: StockMovement | null;
    loading: boolean;
    error: string | null;
    fetchMovements: (companyId: string) => Promise<void>;
    createMovement: (data: CreateStockMovementPayload) => Promise<void>;
    updateMovement: (id: string, data: UpdateStockMovementPayload) => Promise<void>;
    deleteMovement: (id: string) => Promise<void>;
    setSelectedMovement: (m: StockMovement | null) => void;
    clearError: () => void;
}

export const useStockMovementStore = create<StockMovementStore>((set) => ({
    movements: [],
    selectedMovement: null,
    loading: false,
    error: null,

    async fetchMovements(companyId) {
        set({ loading: true });
        try {
            const res = await fetch(`/api/stock-movements/company/${companyId}`);
            const data = await res.json();
            set({ movements: data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    async createMovement(data) {
        try {
            const res = await fetch('/api/stock-movements/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            const newMovement = await res.json();
            set((state) => ({ movements: [newMovement, ...state.movements] }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async updateMovement(id, data) {
        try {
            const res = await fetch(`/api/stock-movements/${id}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            const updated = await res.json();

            set((state) => ({
                movements: state.movements.map((m) => (m.id === id ? updated : m)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async deleteMovement(id) {
        try {
            await fetch(`/api/stock-movements/${id}/delete`, { method: 'DELETE' });
            set((state) => ({
                movements: state.movements.filter((m) => m.id !== id),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    setSelectedMovement(movement) {
        set({ selectedMovement: movement });
    },

    clearError() {
        set({ error: null });
    },
}));
