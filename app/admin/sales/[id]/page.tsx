'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { useSaleStore } from '@/stores/sale-store';
import { useAuthStore } from '@/stores/auth-store';
import { useReactToPrint } from 'react-to-print';

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
    }, [id,getSaleById]);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Facture-${selectedSale?.numberSale || 'recu'}`,
        pageStyle: `
            @page {
                size: A4;
                margin: 20mm;
            }
            @media print {
                * {
                    font-family: Arial, sans-serif !important;
                    color: #000 !important;
                }
                
                body {
                    font-size: 12px;
                    line-height: 1.4;
                    margin: 0;
                    padding: 0;
                }
                
                /* Container styles pour l'impression */
                div[class*="bg-white"] {
                    background: white !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    padding: 20px !important;
                }
                
                /* Header section */
                div[class*="flex justify-between"]:first-child {
                    display: flex !important;
                    justify-content: space-between !important;
                    margin-bottom: 20px !important;
                }
                
                /* Client and payment section */
                div[class*="mt-4 flex justify-between"] {
                    display: flex !important;
                    justify-content: space-between !important;
                    margin: 20px 0 !important;
                }
                
                /* Table styles */
                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin: 20px 0 !important;
                    font-size: 11px !important;
                }
                
                table th,
                table td {
                    border: 1px solid #000 !important;
                    padding: 8px !important;
                }
                
                table th {
                    background-color: #f0f0f0 !important;
                    font-weight: bold !important;
                }
                
                /* Utility classes */
                .text-right {
                    text-align: right !important;
                }
                
                .text-center {
                    text-align: center !important;
                }
                
                .font-bold {
                    font-weight: bold !important;
                }
                
                .capitalize {
                    text-transform: capitalize !important;
                }
                
                /* Totals section */
                div[class*="mt-4 text-right"] {
                    text-align: right !important;
                    margin-top: 20px !important;
                }
                
                /* Footer message */
                p[class*="text-center mt-6"] {
                    text-align: center !important;
                    margin-top: 30px !important;
                    font-size: 10px !important;
                    color: #666 !important;
                }
            }
        `,
    });

    if (loading || !selectedSale) {
        return (
            <div className="p-6 text-center text-gray-600">
                <Loader2 className="animate-spin mx-auto w-6 h-6" />
                Chargement...
            </div>
        );
    }

    const { customer, saleItems, paymentType, saleMode, total, numberSale, createdAt, status } = selectedSale;
    const totalHT = saleItems.reduce((acc, i) => acc + i.total, 0);

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-semibold">Détails de la vente #{numberSale}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/admin/sales')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimer
                    </Button>
                </div>
            </div>

            {/* Zone imprimable */}
            <div ref={invoiceRef} className="bg-white p-6 rounded shadow text-sm">
                <div className="flex justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{user?.company?.name}</h2>
                        <p>{user?.company?.address}</p>
                        <p>{user?.company?.email}</p>
                        <p>{user?.company?.phone}</p>
                    </div>
                    <div className="text-right">
                        <p>N° Vente : <strong>{numberSale}</strong></p>
                        <p>Date : {format(new Date(createdAt), 'dd/MM/yyyy')}</p>
                        <p>Statut : <strong className="capitalize">{status}</strong></p>
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

                <table className="w-full border mt-6 text-xs">
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
                    <p>Total HT : {totalHT.toFixed(2)} FCFA</p>
                    <p className="text-lg font-bold">Total TTC : {total.toFixed(2)} FCFA</p>
                </div>

                <p className="text-center mt-6 text-xs text-gray-500">Merci pour votre achat !</p>
            </div>
        </div>
    );
}