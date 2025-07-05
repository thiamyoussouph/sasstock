'use client';

import React, { useEffect, useState } from 'react';
import { useSupplierStore } from '@/stores/supplier-store';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Label } from '@/components/ui/label';

export default function SupplierPage() {
    const { user } = useAuthStore();
    const companyId = user?.company?.id ?? '';

    const {
        suppliers,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
    } = useSupplierStore();

    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (companyId) {
            fetchSuppliers(companyId);
        }
    }, [companyId, fetchSuppliers]);

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
                companyId,
            };

            if (editingId) {
                await updateSupplier(editingId, payload);
                toast.success('Fournisseur mis à jour');
            } else {
                await createSupplier(payload);
                toast.success('Fournisseur créé');
            }

            setForm({ name: '', phone: '', email: '', address: '' });
            setEditingId(null);
        } catch (e: unknown) {
            if (e instanceof Error) {
                toast.error(e.message);
            } else {
                toast.error("Erreur lors de l'enregistrement");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        const supplier = suppliers.find(s => s.id === id);
        if (!supplier) return;
        setForm({
            name: supplier.name,
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
        });
        setEditingId(id);
    };

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search)
    );

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Liste des fournisseurs', 10, 10);
        autoTable(doc, {
            head: [['Nom', 'Téléphone', 'Email', 'Adresse']],
            body: filtered.map(s => [
                s.name,
                s.phone ?? '-',
                s.email ?? '-',
                s.address ?? '-',
            ]),
        });
        const today = new Date().toISOString().split('T')[0];
        doc.save(`fournisseurs-${today}.pdf`);
    };

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <th className="text-left p-2">Adresse</th>
                            <th className="text-left p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(s => (
                            <tr key={s.id} className="border-b">
                                <td className="p-2">{s.name}</td>
                                <td className="p-2">{s.phone ?? '-'}</td>
                                <td className="p-2">{s.email ?? '-'}</td>
                                <td className="p-2">{s.address ?? '-'}</td>
                                <td className="p-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(s.id)}>
                                        <Pencil size={16} className="text-blue-500" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-400">Aucun fournisseur trouvé.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="space-y-4 bg-white p-4 shadow rounded">
                <h2 className="text-lg font-semibold">{editingId ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h2>

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
