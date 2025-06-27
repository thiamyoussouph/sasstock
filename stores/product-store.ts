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
}

export const useProductStore = create<ProductStore>((set) => ({
    products: [],
    loading: false,
    error: null,

    async fetchProducts(companyId) {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/products/company/${companyId}`);
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
            const res = await fetch(`/api/products/update/${id}`, {
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
            await fetch(`/api/products/delete/${id}`, { method: 'DELETE' });
            set((state) => ({
                products: state.products.filter((p) => p.id !== id),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },
}));
