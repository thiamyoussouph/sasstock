// stores/supplier-store.ts
'use client';

import { create } from 'zustand';
import { Supplier, CreateSupplierPayload, UpdateSupplierPayload } from '@/types/supplier';
import { z } from 'zod';
interface SupplierStore {
    suppliers: Supplier[];
    loading: boolean;
    error: string | null;

    fetchSuppliers: (companyId: string) => Promise<void>;
    createSupplier: (data: CreateSupplierPayload) => Promise<void>;
    updateSupplier: (id: string, data: UpdateSupplierPayload) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
}

export const useSupplierStore = create<SupplierStore>((set) => ({
    suppliers: [],
    loading: false,
    error: null,

    async fetchSuppliers(companyId) {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/suppliers/company/${companyId}`);
            const data = await res.json();
            set({ suppliers: data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    async createSupplier(data) {
        try {
            const res = await fetch('/api/suppliers/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            const created = await res.json();
            set((state) => ({ suppliers: [created, ...state.suppliers] }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async updateSupplier(id, data) {
        try {
            const res = await fetch(`/api/suppliers/${id}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            const updated = await res.json();
            set((state) => ({
                suppliers: state.suppliers.map((s) => (s.id === id ? updated : s)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async deleteSupplier(id) {
        try {
            await fetch(`/api/suppliers/${id}/delete`, { method: 'DELETE' });
            set((state) => ({
                suppliers: state.suppliers.filter((s) => s.id !== id),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },
}));
