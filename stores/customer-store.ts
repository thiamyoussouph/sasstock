'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '@/types/customer';
import { z } from 'zod';

const customerSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    creditLimit: z.number().optional(),
});

interface CustomerStore {
    customers: Customer[];
    selectedCustomer: Customer | null;
    loading: boolean;
    error: string | null;

    fetchCustomers: (companyId: string) => Promise<void>;
    getCustomer: (id: string) => Promise<Customer | null>;
    createCustomer: (data: Partial<Customer> & { companyId: string }) => Promise<void>;
    updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    setSelectedCustomer: (customer: Customer | null) => void;
}

export const useCustomerStore = create<CustomerStore>()(
    persist(
        (set, get) => ({
            customers: [],
            selectedCustomer: null,
            loading: false,
            error: null,

            async fetchCustomers(companyId) {
                set({ loading: true, error: null });
                try {
                    const res = await fetch(`/api/customers/company/${companyId}`);
                    const data = await res.json();
                    set({ customers: data, loading: false });
                } catch (err: any) {
                    set({ error: err.message || 'Erreur chargement clients', loading: false });
                }
            },

            async getCustomer(id) {
                try {
                    const res = await fetch(`/api/customers/${id}`);
                    if (!res.ok) throw new Error('Client introuvable');
                    const customer = await res.json();
                    set({ selectedCustomer: customer });
                    return customer;
                } catch (err: any) {
                    set({ error: err.message });
                    return null;
                }
            },

            async createCustomer(data) {
                try {
                    customerSchema.parse(data);
                    const res = await fetch('/api/customers/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });
                    if (!res.ok) throw new Error(await res.text());
                    const newCustomer = await res.json();
                    set((state) => ({ customers: [newCustomer, ...state.customers] }));
                } catch (err: any) {
                    set({ error: err.message });
                }
            },

            async updateCustomer(id, data) {
                try {
                    customerSchema.partial().parse(data);
                    const res = await fetch(`/api/customers/${id}/update`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });
                    if (!res.ok) throw new Error(await res.text());
                    const updated = await res.json();
                    set((state) => ({
                        customers: state.customers.map((c) => (c.id === id ? updated : c)),
                    }));
                } catch (err: any) {
                    set({ error: err.message });
                }
            },

            async deleteCustomer(id) {
                try {
                    await fetch(`/api/customers/${id}/delete`, { method: 'DELETE' });
                    set((state) => ({
                        customers: state.customers.filter((c) => c.id !== id),
                    }));
                } catch (err: any) {
                    set({ error: err.message });
                }
            },

            setSelectedCustomer(customer) {
                set({ selectedCustomer: customer });
            },
        }),
        { name: 'customer-store' }
    )
);
