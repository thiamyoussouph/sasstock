'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { useSaleStore } from '@/stores/sale-store';
import { useAuthStore } from '@/stores/auth-store';

export default function SaleDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { selectedSale, getSaleById } = useSaleStore();
    const invoiceRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getSaleById(id as string).finally(() => setLoading(false));
        }
    }, [id]);

    const handleExportPDF = async () => {
        if (!invoiceRef.current) return;

        const canvas = await html2canvas(invoiceRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`vente-${selectedSale?.id || 'recu'}.pdf`);
    };

    if (loading || !selectedSale) return <div className="p-6"><Loader2 className="animate-spin" /></div>;

    const { customer, saleItems, paymentType, saleMode, total, numberSale, createdAt, status } = selectedSale;
    const totalHT = saleItems.reduce((acc, i) => acc + i.total, 0);

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-semibold">Détails de la vente #{numberSale}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/admin/sales')}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
                    <Button variant="outline" onClick={handleExportPDF}><Printer className="mr-2 h-4 w-4" /> Imprimer</Button>
                </div>
            </div>

            <div ref={invoiceRef} className="bg-white p-6 rounded shadow">
                <div className="flex justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{user?.company?.name}</h2>
                        <p>{user?.company?.address}</p>
                        <p>{user?.company?.email}</p>
                        <p>{user?.company?.phone}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm">N° Vente : <strong>{numberSale}</strong></p>
                        <p className="text-sm">Date : {format(new Date(createdAt), 'dd/MM/yyyy')}</p>
                        <p className="text-sm capitalize">Statut : <strong>{status}</strong></p>
                    </div>
                </div>

                <div className="mt-4 flex justify-between">
                    <div>
                        <p className="font-semibold">Client :</p>
                        <p>{customer?.name || 'Client passager'}</p>
                        <p>{customer?.address || '-'}</p>
                        <p>{customer?.phone || '-'}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Mode de vente :</strong> {saleMode}</p>
                        <p><strong>Paiement :</strong> {paymentType}</p>
                    </div>
                </div>

                <table className="w-full text-sm border mt-6">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1 text-left">Produit</th>
                            <th className="border px-2 py-1 text-right">Qté</th>
                            <th className="border px-2 py-1 text-right">PU</th>
                            <th className="border px-2 py-1 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {saleItems.map((item, i) => (
                            <tr key={i}>
                                <td className="border px-2 py-1">{item.productId}</td>
                                <td className="border px-2 py-1 text-right">{item.quantity}</td>
                                <td className="border px-2 py-1 text-right">{item.unitPrice.toFixed(2)} FCFA</td>
                                <td className="border px-2 py-1 text-right">{item.total.toFixed(2)} FCFA</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 text-right">
                    <p className="text-sm">Total HT : {totalHT.toFixed(2)} FCFA</p>
                    <p className="text-lg font-bold">Total TTC : {total.toFixed(2)} FCFA</p>
                </div>

                <p className="text-center mt-6 text-xs text-gray-500">Merci pour votre achat !</p>
            </div>
        </div>
    );
}
