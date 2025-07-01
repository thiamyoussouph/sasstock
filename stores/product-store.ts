'use client';

import { create } from 'zustand';
import { Product, CreateProductPayload, UpdateProductPayload } from '@/types/product';

interface ProductStore {
    products: Product[];
    loading: boolean;
    error: string | null;
    fetchProducts: (companyId: string) => Promise<void>;
    createProduct: (data: CreateProductPayload) => Promise<void>;
    updateProduct: (data: UpdateProductPayload) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    toggleProductStatus: (id: string, isActive: boolean) => Promise<void>;
    getProductById: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    loading: false,
    error: null,

    async fetchProducts(companyId) {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/products/company/${companyId}`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            set({ products: data, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Erreur chargement produits', loading: false });
        }
    },

    async createProduct(data) {
        try {
            const res = await fetch('/api/products/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            const created = await res.json();
            set((state) => ({ products: [created, ...state.products] }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async updateProduct({ id, ...data }) {
        try {
            const res = await fetch(`/api/products/${id}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            const updated = await res.json();
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? updated : p)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async deleteProduct(id) {
        try {
            const res = await fetch(`/api/products/delete/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(await res.text());
            set((state) => ({
                products: state.products.filter((p) => p.id !== id),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async toggleProductStatus(id, isActive) {
        try {
            const res = await fetch(`/api/products/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive }),
            });
            if (!res.ok) throw new Error(await res.text());

            const updated = await res.json();
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? updated : p)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    getProductById(id) {
        return get().products.find((p) => p.id === id);
    },
}));
