'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useStockMovementStore } from '@/stores/stock-movement-store';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function StockMovementList() {
    const router = useRouter();
    const { user } = useAuthStore();
    const companyId = user?.company?.id ?? '';

    const { movements, fetchMovements } = useStockMovementStore();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (companyId) fetchMovements(companyId);
    }, [companyId]);

    const filteredMovements = movements.filter((m) => {
        const date = new Date(m.createdAt);
        const startOk = !startDate || date >= new Date(startDate);
        const endOk = !endDate || date <= new Date(endDate);
        return startOk && endOk;
    });

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Mouvements de Stock', 10, 10);
        autoTable(doc, {
            head: [['Type', 'Date', 'Description', 'Créé par', 'Nb. produits']],
            body: filteredMovements.map((m) => [
                m.type,
                format(new Date(m.createdAt), 'dd/MM/yyyy'),
                m.description ?? '-',
                m.createdBy ?? '-',
                m.items.length.toString(),
            ]),
        });
        const date = new Date().toISOString().split('T')[0];
        doc.save(`mouvements-stock-${date}.pdf`);
    };

    return (
        <div className="p-6 space-y-4 bg-white shadow rounded">
            <div className="flex flex-wrap justify-between gap-4 items-center">
                <div className="flex gap-2 items-center">
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportPDF}>Exporter PDF</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/admin/stock-movements/create')}>+ Nouveau Mouvement</Button>
                </div>
            </div>

            <table className="w-full text-sm mt-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Créé par</th>
                        <th className="text-left p-2">Nb. produits</th>
                        <th className="text-left p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMovements.map((m) => (
                        <tr key={m.id} className="border-b">
                            <td className="p-2 font-medium uppercase">{m.type}</td>
                            <td className="p-2">{format(new Date(m.createdAt), 'dd/MM/yyyy')}</td>
                            <td className="p-2">{m.description ?? '-'}</td>
                            <td className="p-2">{m.createdBy ?? '-'}</td>
                            <td className="p-2">{m.items.length}</td>
                            <td className="p-2 space-x-2">
                                <Button
                                className='bg-blue-400 hover:bg-blue-500 text-white'
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.push(`/admin/stock-movements/${m.id}`)}
                                >
                                    Détails
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className='bg-orange-400 hover:bg-orange-500 text-white'
                                    onClick={() => router.push(`/admin/stock-movements/${m.id}/edit`)}
                                >
                                    Modifier
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {filteredMovements.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-4 text-gray-500">
                                Aucun mouvement trouvé.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
