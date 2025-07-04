'use client';

import { create } from 'zustand';
import { Product, CreateProductPayload, UpdateProductPayload } from '@/types/product';

interface ProductStore {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    error: string | null;

    fetchProducts: (
        companyId: string,
        options?: { page?: number; search?: string; categoryId?: string, limit?: number; }
    ) => Promise<void>;
    createProduct: (data: CreateProductPayload) => Promise<void>;
    updateProduct: (data: UpdateProductPayload) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    toggleProductStatus: (id: string, isActive: boolean) => Promise<void>;
    getProductById: (id: string) => Product | undefined;
    uploadProductFile: (file: File, companyId: string) => Promise<string[]>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,

    async fetchProducts(companyId, options = {}) {
        const {
            page = 1,
            search = '',
            categoryId = '',
            limit = 15, // ✅ Par défaut
        } = options;

        set({ loading: true, error: null });

        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (categoryId) params.append('categoryId', categoryId);

        try {
            const res = await fetch(`/api/products/company/${companyId}?${params.toString()}`);
            if (!res.ok) throw new Error(await res.text());

            const result = await res.json(); // { data, total, page, totalPages }
            set({
                products: result.data,
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                loading: false,
            });
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

    async uploadProductFile(file, companyId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', companyId);

        try {
            const res = await fetch('/api/products/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error(await res.text());

            const data = await res.json(); // { created, duplicates, newCategories }
            await get().fetchProducts(companyId); // ✅ Rafraîchit après import
            return data.duplicates || [];
        } catch (err: any) {
            set({ error: err.message || 'Erreur upload fichier' });
            return [];
        }
    },
}));
