import { CreateStockMovementPayload, StockMovement } from '@/types/stock-movements';
import { create } from 'zustand';

interface StockMovementStore {
    movements: StockMovement[];
    loading: boolean;
    error: string | null;
    fetchMovements: (companyId: string) => Promise<void>;
    createMovement: (data: CreateStockMovementPayload) => Promise<void>;
    deleteMovement: (id: string) => Promise<void>;
}

export const useStockMovementStore = create<StockMovementStore>((set) => ({
    movements: [],
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
            if (!res.ok) throw new Error('Erreur lors de la création du mouvement');
            const newMovement = await res.json();
            set((state) => ({ movements: [newMovement, ...state.movements] }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async deleteMovement(id) {
        try {
            await fetch(`/api/stock-movements/${id}/delete`, { method: 'DELETE' });
            set((state) => ({ movements: state.movements.filter((m) => m.id !== id) }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },
}));
