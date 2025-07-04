'use client';

import { create } from 'zustand';
import { Sale, CreateSalePayload, UpdateSalePayload } from '@/types/sale';

interface SaleStore {
    sales: Sale[];
    selectedSale: Sale | null;
    loading: boolean;
    error: string | null;

    fetchSales: (params: {
        companyId: string;
        page?: number;
        limit?: number;
        clientId?: string;
        startDate?: string;
        endDate?: string;
    }) => Promise<void>;

    getSaleById: (id: string) => Promise<void>;
    createSale: (data: CreateSalePayload) => Promise<Sale>;
    updateSale: (id: string, data: UpdateSalePayload) => Promise<void>;
    deleteSale: (id: string) => Promise<void>;
    clearSelectedSale: () => void;
    getNextSaleNumber: (companyId: string) => Promise<string | null>;
}

export const useSaleStore = create<SaleStore>((set) => ({
    sales: [],
    selectedSale: null,
    loading: false,
    error: null,

    async fetchSales({ companyId, page = 1, limit = 10, clientId, startDate, endDate }) {
        set({ loading: true, error: null });

        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (clientId) params.append('clientId', clientId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        try {
            const res = await fetch(`/api/sales/company/${companyId}?${params.toString()}`);
            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            set({ sales: data, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Erreur chargement ventes', loading: false });
        }
    },

    async getSaleById(id) {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/sales/${id}`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            set({ selectedSale: data, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Erreur chargement vente', loading: false });
        }
    },

    async createSale(data: CreateSalePayload): Promise<Sale> {
        try {
            const res = await fetch('/api/sales/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error(await res.text());

            const created: Sale = await res.json();
            set((state) => ({ sales: [created, ...state.sales] }));
            return created;
        } catch (err: any) {
            set({ error: err.message || 'Erreur création vente' });
            throw err;
        }
    },

    async updateSale(id: string, data: UpdateSalePayload) {
        try {
            const res = await fetch(`/api/sales/${id}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    payments: data.payments || [],
                    saleItems: data.saleItems || [],
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            const updated = await res.json();
            set((state) => ({
                sales: state.sales.map((s) => (s.id === id ? updated : s)),
            }));
        } catch (err: any) {
            set({ error: err.message || 'Erreur modification vente' });
        }
    },

    async deleteSale(id) {
        try {
            const res = await fetch(`/api/sales/${id}/delete`, { method: 'DELETE' });
            if (!res.ok) throw new Error(await res.text());
            set((state) => ({
                sales: state.sales.filter((s) => s.id !== id),
            }));
        } catch (err: any) {
            set({ error: err.message || 'Erreur suppression vente' });
        }
    },

    async getNextSaleNumber(companyId: string) {
        try {
            const res = await fetch(`/api/sales/company/${companyId}/next-number`);
            if (!res.ok) throw new Error(await res.text());
            const { number } = await res.json();
            return number;
        } catch (err: any) {
            set({ error: err.message || 'Erreur récupération numéro vente' });
            return null;
        }
    },

    clearSelectedSale() {
        set({ selectedSale: null });
    },
}));
