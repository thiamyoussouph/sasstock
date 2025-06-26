'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Pencil, CreditCard } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoiceStore } from '@/stores/invoice-store';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function InvoiceList() {
    const { invoices, fetchInvoicesByCompany } = useInvoiceStore();
    const companyId = useAuthStore((state) => state.user?.companyId);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [mounted, setMounted] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (companyId) {
            fetchInvoicesByCompany(companyId);
        }
    }, [companyId, fetchInvoicesByCompany]);

    const filteredInvoices = invoices.filter((inv) => {
        const matchStatus = statusFilter === 'all' ? true : inv.status === statusFilter;
        const matchSearch = search ? inv.title.toLowerCase().includes(search.toLowerCase()) : true;
        const matchDateFrom = dateFrom ? new Date(inv.createdAt) >= new Date(dateFrom) : true;
        const matchDateTo = dateTo ? new Date(inv.createdAt) <= new Date(dateTo) : true;
        return matchStatus && matchSearch && matchDateFrom && matchDateTo;
    });

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">Liste des factures</h2>
                <Button onClick={() => router.push('/admin/invoices/create')} className="bg-blue-600 text-white">Nouvelle facture</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Input placeholder="Rechercher par titre" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="unpaid">Impayé</SelectItem>
                        <SelectItem value="partial">Partiel</SelectItem>
                        <SelectItem value="overdue">En retard</SelectItem>
                    </SelectContent>
                </Select>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-sm">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                            <th className="p-2 text-left">Titre</th>
                            <th className="p-2 text-left">Numéro</th>
                            <th className="p-2 text-left">Total</th>
                            <th className="p-2 text-left">Statut</th>
                            <th className="p-2 text-left">Échéance</th>
                            <th className="p-2 text-left">Création</th>
                            <th className="p-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="border-b dark:border-gray-700">
                                <td className="p-2">{inv.title}</td>
                                <td className="p-2">{inv.invoiceNumber}</td>
                                <td className="p-2">{inv.total}</td>
                                <td className="p-2 capitalize">{inv.status}</td>
                                <td className="p-2">{inv.dueDate ? format(new Date(inv.dueDate), 'dd/MM/yyyy') : '-'}</td>
                                <td className="p-2">{format(new Date(inv.createdAt), 'dd/MM/yyyy')}</td>
                                <td className="p-2 flex gap-2">
                                    <Link href={`/admin/invoices/${inv.id}`}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="w-4 h-4 mr-1" />
                                            Voir
                                        </Button>
                                    </Link>

                                    <Link href={`/admin/invoices/${inv.id}/edit`}>
                                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                                            <Pencil className="w-4 h-4 mr-1" />
                                            Modifier
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                        onClick={() => setSelectedInvoiceId(inv.id)}
                                    >
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        Payer
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={!!selectedInvoiceId} onOpenChange={() => setSelectedInvoiceId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Changer le statut de la facture</DialogTitle>
                    </DialogHeader>
                    {/* Ici, ajoutez un formulaire ou des boutons pour changer le statut de la facture */}
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setSelectedInvoiceId(null)}>Fermer</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
