'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useSaleStore } from '@/stores/sale-store';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import PaymentModal from '@/components/sale/PaymentModal';
import { toast } from 'react-toastify';

export default function SalesListPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const companyId = user?.company?.id;

    const { sales, fetchSales } = useSaleStore();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

    useEffect(() => {
        if (companyId) {
            fetchSales({ companyId, page, limit, startDate, endDate });
        }
    }, [companyId, page, limit, startDate, endDate, fetchSales]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Liste des ventes', 10, 10);
        autoTable(doc, {
            head: [['N° Vente', 'Client', 'Date', 'Montant', 'Paiement']],
            body: sales.map((sale) => [
                sale.numberSale,
                sale.customer?.name ?? '-',
                format(new Date(sale.createdAt), 'dd/MM/yyyy'),
                `${sale.total.toFixed(2)} FCFA`,
                sale.paymentType,
            ]),
        });
        const date = new Date().toISOString().split('T')[0];
        doc.save(`ventes-${date}.pdf`);
    };

    const handleOpenPayment = (id: string) => {
        setSelectedSaleId(id);
        setShowPayment(true);
    };

    const handleCancelSale = async (id: string) => {
        const confirm = window.confirm('Voulez-vous vraiment annuler cette vente ?');
        if (!confirm) return;

        try {
            const res = await fetch(`/api/sales/${id}/cancel`, {
                method: 'PUT',
            });
            if (!res.ok) throw new Error(await res.text());

            toast.success('Vente annulée.');
            if (companyId) {
                fetchSales({ companyId, page, limit, startDate, endDate });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erreur lors de l’annulation';
            toast.error(message);
        }
    };

    return (
        <div className="p-6 bg-white rounded shadow space-y-4">
            <div className="flex flex-wrap justify-between gap-4 items-center">
                <div className="flex gap-2">
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportPDF} variant="outline" className="flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Exporter PDF
                    </Button>
                    <Button
                        onClick={() => router.push('/admin/sales/create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Nouvelle vente
                    </Button>
                </div>
            </div>

            <table className="w-full text-sm mt-4">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">N° Vente</th>
                        <th className="p-2 text-left">Client</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-right">Montant</th>
                        <th className="p-2 text-left">Paiement</th>
                        <th className="p-2 text-left">Statut</th>
                        <th className="p-2 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{sale.numberSale}</td>
                            <td className="p-2">{sale.customer?.name ?? '-'}</td>
                            <td className="p-2">{format(new Date(sale.createdAt), 'dd/MM/yyyy')}</td>
                            <td className="p-2 text-right">{sale.total.toFixed(2)} FCFA</td>
                            <td className="p-2">{sale.paymentType}</td>
                            <td className="p-2">
                                <span className={`text-xs px-2 py-1 rounded ${sale.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                        sale.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                                            sale.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-600'
                                    }`}>
                                    {sale.status}
                                </span>
                            </td>
                            <td className="p-2 text-center space-x-1">
                                <Button size="sm" className='bg-yellow-400' variant="outline" onClick={() => router.push(`/admin/sales/${sale.id}/edit`)}>
                                    Modifier
                                </Button>
                                <Button size="sm" className='bg-blue-300' variant="secondary" onClick={() => router.push(`/admin/sales/${sale.id}`)}>
                                    Détails
                                </Button>
                                <Button size="sm" className='bg-green-600 text-white' variant="ghost" onClick={() => handleOpenPayment(sale.id)}>
                                    Payer
                                </Button>
                                {sale.status !== 'CANCELLED' && (
                                    <Button size="sm" className='bg-red-500 text-white' variant="ghost" onClick={() => handleCancelSale(sale.id)}>
                                        Annuler
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    Page précédente
                </Button>
                <Button variant="outline" onClick={() => setPage(p => p + 1)}>
                    Page suivante
                </Button>
            </div>

            <PaymentModal
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
                saleId={selectedSaleId || ''}
                onSubmit={() => {
                    setShowPayment(false);
                    if (!companyId) return;
                    fetchSales({ companyId, page, limit, startDate, endDate });
                }}
            />
        </div>
    );
}
