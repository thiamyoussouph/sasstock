'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStockMovementStore } from '@/stores/stock-movement-store';
import { useProductStore } from '@/stores/product-store';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer, Download } from 'lucide-react';

export default function StockMovementDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { movements } = useStockMovementStore();
    const { products, fetchProducts } = useProductStore();

    const [movement, setMovement] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        documentTitle: `mouvement-stock-${id}`,
        print: async () => {
            if (printRef.current) {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(printRef.current.outerHTML);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                }
            }
        },
    });

    useEffect(() => {
        const found = movements.find((m) => m.id === id);
        if (found) {
            setMovement(found);
            if (products.length === 0) {
                fetchProducts(found.companyId);
            }
        }
    }, [id, movements, products, fetchProducts]);

    const exportPDF = () => {
        if (!movement) return;

        const doc = new jsPDF();
        doc.text(`Détail du Mouvement - ${movement.type}`, 10, 10);
        doc.text(`Date: ${format(new Date(movement.createdAt), 'dd/MM/yyyy')}`, 10, 18);
        doc.text(`Créé par: ${movement.createdBy || '-'}`, 10, 26);
        doc.text(`Description: ${movement.description || '-'}`, 10, 34);

        autoTable(doc, {
            startY: 42,
            head: [['Produit', 'Quantité', 'Prix d’achat']],
            body: movement.items.map((item: any) => {
                const product = products.find((p) => p.id === item.productId);
                return [
                    product?.name || 'Produit supprimé',
                    item.quantity.toString(),
                    item.purchasePrice?.toFixed(2) || '-',
                ];
            }),
        });

        const date = new Date().toISOString().split('T')[0];
        doc.save(`mouvement-stock-${date}.pdf`);
    };

    if (!movement) return <p className="p-6">Chargement...</p>;

    return (
        <div className="p-6 space-y-4 bg-white shadow rounded">
            {/* Boutons uniquement visibles à l’écran */}
            <div className="flex gap-2 justify-end mb-4 print:hidden">
                <Button
                    onClick={() => router.push('/admin/stock-movements')}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                    variant="outline"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>

                <Button
                    onClick={handlePrint}
                    className="bg-green-100 text-green-700 hover:bg-green-200"
                    variant="outline"
                >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                </Button>

                <Button
                    onClick={exportPDF}
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                    variant="outline"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter PDF
                </Button>
            </div>

            {/* Bloc imprimable */}
            <div ref={printRef} className="space-y-4 text-sm print:text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p><strong>Type :</strong> {movement.type}</p>
                    <p><strong>Date :</strong> {format(new Date(movement.createdAt), 'dd/MM/yyyy')}</p>
                    <p><strong>Créé par :</strong> {movement.createdBy || '-'}</p>
                    <p><strong>Description :</strong> {movement.description || '-'}</p>
                </div>

                <table className="w-full text-sm border mt-4 print:text-xs print:border-none">
                    <thead className="bg-gray-100 print:bg-transparent">
                        <tr>
                            <th className="border px-3 py-2 text-left">Produit</th>
                            <th className="border px-3 py-2 text-right">Quantité</th>
                            <th className="border px-3 py-2 text-right">Prix d'achat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movement.items.map((item: any) => {
                            const product = products.find(p => p.id === item.productId);
                            return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border px-3 py-2">{product?.name || 'Produit supprimé'}</td>
                                    <td className="border px-3 py-2 text-right">{item.quantity}</td>
                                    <td className="border px-3 py-2 text-right">{item.purchasePrice?.toFixed(2) || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
