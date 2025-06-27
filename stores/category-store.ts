// --- stores/category-store.ts ---
'use client';
import { create } from 'zustand';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category';

interface CategoryStore {
    categories: Category[];
    selectedCategory: Category | null;
    loading: boolean;
    error: string | null;
    fetchCategories: (companyId: string) => Promise<void>;
    createCategory: (data: CreateCategoryPayload) => Promise<void>;
    updateCategory: (data: UpdateCategoryPayload) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    setSelectedCategory: (cat: Category | null) => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
    categories: [],
    selectedCategory: null,
    loading: false,
    error: null,

    async fetchCategories(companyId) {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/categories/company/${companyId}`);
            const data = await res.json();
            set({ categories: data, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Erreur chargement', loading: false });
        }
    },

    async createCategory(data) {
        try {
            const res = await fetch('/api/categories/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            const created = await res.json();
            set((state) => ({ categories: [created, ...state.categories] }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async updateCategory({ id, name }) {
        try {
            const res = await fetch(`/api/categories/${id}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error(await res.text());
            const updated = await res.json();
            set((state) => ({
                categories: state.categories.map((cat) => (cat.id === id ? updated : cat)),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    async deleteCategory(id) {
        try {
            await fetch(`/api/categories/${id}/delete`, { method: 'DELETE' });
            set((state) => ({
                categories: state.categories.filter((cat) => cat.id !== id),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    setSelectedCategory(cat) {
        set({ selectedCategory: cat });
    },
}));
