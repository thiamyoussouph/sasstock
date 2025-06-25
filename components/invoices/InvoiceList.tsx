'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoiceStore } from '@/stores/invoice-store';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

export default function InvoiceList() {
    const { invoices, fetchInvoicesByCompany } = useInvoiceStore();
    const companyId = useAuthStore((state) => state.user?.companyId);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [mounted, setMounted] = useState(false);
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

    const exportPDF = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [['Titre', 'Client', 'Total', 'Statut', "Échéance", 'Création']],
            body: filteredInvoices.map((inv) => [
                inv.title,
                inv.customer?.name || '-',
                inv.total,
                inv.status,
                inv.dueDate ? format(new Date(inv.dueDate), 'dd/MM/yyyy') : '-',
                format(new Date(inv.createdAt), 'dd/MM/yyyy'),
            ]),
        });
        doc.save('invoices.pdf');
    };

    const csvData = filteredInvoices.map((inv) => ({
        Titre: inv.title,
        Client: inv.customer?.name || '-',
        Total: inv.total,
        Statut: inv.status,
        "Échéance": inv.dueDate ? format(new Date(inv.dueDate), 'dd/MM/yyyy') : '-',
        "Création": format(new Date(inv.createdAt), 'dd/MM/yyyy'),
    }));

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
            {/* HEADER TITRE + ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <h2 className="text-2xl font-bold">Liste des factures</h2>
                <div className="flex gap-2">
                    <Button onClick={() => router.push('/admin/invoices/new')} className="bg-blue-600 text-white hover:bg-blue-700">
                        Nouvelle facture
                    </Button>
                    <Button onClick={exportPDF}>Exporter en PDF</Button>
                    {mounted && (
                        <CSVLink data={csvData} filename="invoices.csv">
                            <Button variant="outline">Exporter en CSV</Button>
                        </CSVLink>
                    )}
                </div>
            </div>

            {/* FILTRES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Rechercher par titre */}
                <div className="flex flex-col">
                    <label htmlFor="search" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rechercher par titre
                    </label>
                    <Input id="search" placeholder="Titre de la facture" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                {/* Statut */}
                <div className="flex flex-col">
                    <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Statut
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="paid">Payé</SelectItem>
                            <SelectItem value="unpaid">Impayé</SelectItem>
                            <SelectItem value="partial">Partiel</SelectItem>
                            <SelectItem value="overdue">En retard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date de création */}
                <div className="flex flex-col">
                    <label htmlFor="dateFrom" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date de création
                    </label>
                    <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>

                {/* Date d'échéance */}
                <div className="flex flex-col">
                    <label htmlFor="dateTo" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date d’échéance
                    </label>
                    <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
            </div>



            {/* TABLEAU */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-sm">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                            <th className="p-2 text-left">Titre</th>
                            <th className="p-2 text-left">Client</th>
                            <th className="p-2 text-left">Total</th>
                            <th className="p-2 text-left">Statut</th>
                            <th className="p-2 text-left">Échéance</th>
                            <th className="p-2 text-left">Création</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="border-b dark:border-gray-700">
                                <td className="p-2">{inv.title}</td>
                                <td className="p-2">{inv.customer?.name || '-'}</td>
                                <td className="p-2">{inv.total}</td>
                                <td className="p-2 capitalize">{inv.status}</td>
                                <td className="p-2">{inv.dueDate ? format(new Date(inv.dueDate), 'dd/MM/yyyy') : '-'}</td>
                                <td className="p-2">{format(new Date(inv.createdAt), 'dd/MM/yyyy')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
