'use client';

import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '@/stores/customer-store';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Label } from '@/components/ui/label';

export default function CustomerPage() {
    const { user } = useAuthStore();
    const companyId = user?.company?.id ?? '';

    const {
        customers,
        fetchCustomers,
        createCustomer,
        updateCustomer,
    } = useCustomerStore();

    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        creditLimit: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (companyId) {
            fetchCustomers(companyId);
        }
    }, [companyId, fetchCustomers]);

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error("Le nom est requis.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: form.name,
                phone: form.phone || undefined,
                email: form.email || undefined,
                address: form.address || undefined,
                creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined,
                companyId,
            };

            if (editingId) {
                await updateCustomer(editingId, payload);
                toast.success('Client mis à jour');
            } else {
                await createCustomer(payload);
                toast.success('Client créé');
            }

            setForm({ name: '', phone: '', email: '', address: '', creditLimit: '' });
            setEditingId(null);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Une erreur est survenue';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        const client = customers.find(c => c.id === id);
        if (!client) return;
        setForm({
            name: client.name,
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || '',
            creditLimit: client.creditLimit?.toString() || '',
        });
        setEditingId(id);
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    );

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Liste des clients', 10, 10);
        autoTable(doc, {
            head: [['Nom', 'Téléphone', 'Email', 'Adresse', 'Crédit', 'Limite']],
            body: filtered.map(c => [
                c.name,
                c.phone ?? '-',
                c.email ?? '-',
                c.address ?? '-',
                `${c.credit.toFixed(2)} fr`,
                c.creditLimit?.toFixed(2) ?? '-',
            ]),
        });
        const today = '2025-06-28';
        doc.save(`clients-${today}.pdf`);
    };

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Liste clients */}
            <div className="md:col-span-2 space-y-4 bg-white rounded shadow p-4">
                <div className="flex items-center justify-between">
                    <Input
                        placeholder="Rechercher par nom ou téléphone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-1/2"
                    />
                    <Button onClick={exportPDF} variant="outline">Exporter PDF</Button>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="text-left p-2">Nom</th>
                            <th className="text-left p-2">Téléphone</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Crédit</th>
                            <th className="text-left p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id} className="border-b">
                                <td className="p-2">{c.name}</td>
                                <td className="p-2">{c.phone ?? '-'}</td>
                                <td className="p-2">{c.email ?? '-'}</td>
                                <td className="p-2">{c.credit.toFixed(2)} €</td>
                                <td className="p-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(c.id)}>
                                        <Pencil size={16} className="text-blue-500" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-400">Aucun client trouvé.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Formulaire */}
            <div className="space-y-4 bg-white p-4 shadow rounded">
                <h2 className="text-lg font-semibold">{editingId ? 'Modifier le client' : 'Nouveau client'}</h2>

                <div className="space-y-2">
                    <Label className="block text-sm font-medium text-gray-700">Nom</Label>
                    <Input placeholder="Nom *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <Label className="block text-sm font-medium text-gray-700">Téléphone</Label>
                    <Input placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    <Label className="block text-sm font-medium text-gray-700">Email</Label>
                    <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    <Label className="block text-sm font-medium text-gray-700">Adresse</Label>
                    <Input placeholder="Adresse" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>

                <Button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-900 hover:bg-blue-950">
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : editingId ? "Mettre à jour" : "Créer"}
                </Button>
            </div>
        </div>
    );
}
