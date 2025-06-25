'use client';

import { create } from 'zustand';
import { Invoice } from '@/types/invoice';
import { persist } from 'zustand/middleware';

interface InvoiceStore {
    invoices: Invoice[];
    selectedInvoice: Invoice | null;
    loading: boolean;
    error: string | null;

    fetchInvoicesByCompany: (companyId: string) => Promise<void>;
    getInvoiceDetails: (id: string) => Promise<void>;
    createInvoice: (data: Partial<Invoice>) => Promise<void>;
    updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
    filterInvoices: (filters: { status?: string; startDate?: string; endDate?: string }) => Promise<void>;
    clearSelectedInvoice: () => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
    persist(
        (set) => ({
            invoices: [],
            selectedInvoice: null,
            loading: false,
            error: null,

            async fetchInvoicesByCompany(companyId) {
                set({ loading: true, error: null });
                try {
                    const res = await fetch(`/api/invoices/company/${companyId}`);
                    const data = await res.json();
                    set({ invoices: data, loading: false });
                } catch (err) {
                    set({ error: 'Erreur lors du chargement des factures.', loading: false });
                }
            },

            async getInvoiceDetails(id) {
                set({ loading: true, error: null });
                try {
                    const res = await fetch(`/api/invoices/details/${id}`);
                    const data = await res.json();
                    set({ selectedInvoice: data, loading: false });
                } catch (err) {
                    set({ error: 'Erreur lors du chargement des détails.', loading: false });
                }
            },

            async createInvoice(data) {
                set({ loading: true, error: null });
                try {
                    const res = await fetch('/api/invoices/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (!res.ok) throw new Error('Erreur lors de la création de la facture');

                    const newInvoice = await res.json();
                    set((state) => ({
                        invoices: [newInvoice, ...state.invoices],
                        loading: false,
                    }));
                } catch (err: any) {
                    set({ error: err.message, loading: false });
                }
            },

            async updateInvoice(id, data) {
                set({ loading: true, error: null });
                try {
                    const res = await fetch(`/api/invoices/update/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (!res.ok) throw new Error('Erreur lors de la mise à jour');

                    const updated = await res.json();
                    set((state) => ({
                        invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
                        loading: false,
                    }));
                } catch (err: any) {
                    set({ error: err.message, loading: false });
                }
            },

            async filterInvoices(filters) {
                set({ loading: true, error: null });
                try {
                    const res = await fetch('/api/invoices/filter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(filters),
                    });

                    const data = await res.json();
                    set({ invoices: data, loading: false });
                } catch (err) {
                    set({ error: 'Erreur lors du filtrage.', loading: false });
                }
            },

            clearSelectedInvoice() {
                set({ selectedInvoice: null });
            },
        }),
        {
            name: 'invoice-store',
        }
    )
);
