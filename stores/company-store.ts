// stores/company-store.ts
import { create } from 'zustand';
import { Company } from '@/types/company';

interface CompanyStore {
    companies: Company[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    fetchCompanies: (page?: number) => Promise<void>;
    createCompany: (data: Partial<Company>) => Promise<void>;
    updateCompany: (data: Partial<Company> & { id: string }) => Promise<void>;
    deleteCompany: (id: string) => Promise<void>;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
    companies: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,

    async fetchCompanies(page = 1) {
        set({ loading: true });
        try {
            const res = await fetch(`/api/companies?page=${page}`);
            const result = await res.json();

            set({
                companies: result.data,
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                loading: false,
            });
        } catch (err: any) {
            set({ error: err.message || 'Erreur de chargement', loading: false });
        }
    },

    async createCompany(data) {
        const res = await fetch('/api/companies/create', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Erreur lors de la création');
    },

    async updateCompany(data) {
        const res = await fetch(`/api/companies/${data.id}/update`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Erreur lors de la mise à jour');
    },

    async deleteCompany(id) {
        const res = await fetch(`/api/companies/${id}/delete`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Erreur lors de la suppression');
    },
}));
