'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Loader2, CheckCircle, Printer, ArrowLeft, Pencil } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function InvoiceDetailPage() {
    const { token } = useAuthStore();
    const { id } = useParams();
    const router = useRouter();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/invoices/details/${id}`)
            .then((res) => res.json())
            .then((data) => setInvoice(data))
            .catch(() => toast.error("Erreur lors du chargement de la facture"))
            .finally(() => setLoading(false));
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
        pdf.save(`${invoice.invoiceNumber || 'facture'}.pdf`);
    };

    const handleMarkAsPaid = async () => {
        try {
            await fetch(`/api/invoices/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'paid' }),
            });
            toast.success('Facture marquée comme payée');
            setInvoice({ ...invoice, status: 'paid' });
        } catch (err) {
            toast.error("Erreur lors de la mise à jour du statut");
        }
    };

    if (loading) return <div className="p-6"><Loader2 className="animate-spin" /></div>;
    if (!invoice) return <div className="p-6 text-red-600">Facture introuvable.</div>;

    const {
        invoiceNumber,
        title,
        issueDate,
        dueDate,
        company,
        customer,
        invoiceItems,
        tva,
        status
    } = invoice;

    const totalHT = invoiceItems.reduce((acc: number, p: any) => acc + p.total, 0);
    const totalTVA = tva ? (totalHT * tva) / 100 : 0;
    const totalTTC = totalHT + totalTVA;

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-semibold">Détails de la facture <span className='font-bold'>{title}</span></h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/admin/invoices')}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
                    <Button variant="outline" onClick={() => router.push(`/admin/invoices/${id}/edit`)}><Pencil className="mr-2 h-4 w-4" /> Modifier</Button>
                    <Button variant="outline" onClick={handleExportPDF}><Printer className="mr-2 h-4 w-4" /> Imprimer</Button>
                    {status !== 'paid' && (
                        <Button className="bg-green-600 text-white" onClick={handleMarkAsPaid}><CheckCircle className="mr-2 h-4 w-4" /> Marquer comme payée</Button>
                    )}
                </div>
            </div>

            <div ref={invoiceRef} className="bg-white text-black p-6 rounded shadow  relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-[120px] font-extrabold text-gray-300 opacity-20 rotate-[-30deg]">
                        FACTURE
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    {/* À gauche : logo ou texte "FACTURE" */}
                    <div>
                        {company?.logoUrl ? (
                            <img src={company.logoUrl} alt="Logo de l'entreprise" className="h-16 object-contain" />
                        ) : (
                            <h2 className="text-4xl font-extrabold tracking-tight">FACTURE</h2>
                        )}
                    </div>

                    {/* À droite : infos de la facture */}
                    <div className="text-right">
                        <p className="text-md font-bold text-gray-600">Facture n° {invoiceNumber}</p>
                        <p className="text-sm">{title}</p>
                        <p className="text-sm">Date : {format(new Date(issueDate), 'dd/MM/yyyy')}</p>
                        <p className="text-sm">Échéance : {format(new Date(dueDate), 'dd/MM/yyyy')}</p>
                        <p className="text-sm capitalize">
                            Statut : <strong>{status}</strong>
                        </p>
                    </div>
                </div>


                <div className="flex justify-between items-start mt-6">
                    {/* Informations de la société - à gauche */}
                    <div className="text-sm text-left">
                        <p><strong>{company?.name}</strong></p>
                        <p>{company?.address}</p>
                        <p>{company?.email}</p>
                        <p>{company?.phone}</p>
                    </div>

                    {/* Informations du client - à droite */}
                    <div className="text-sm text-right">
                        <p className="font-bold">Client :</p>
                        <p>{customer?.name || '—'}</p>
                        <p>{customer?.address || '—'}</p>
                        <p>{customer?.email || ''}</p>
                        <p>{customer?.phone || ''}</p>
                    </div>
                </div>

                <table className="w-full text-sm border mt-4">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1 text-left">#</th>
                            <th className="border px-2 py-1 text-left">Désignation</th>
                            <th className="border px-2 py-1 text-right">Quantité</th>
                            <th className="border px-2 py-1 text-right">PU</th>
                            <th className="border px-2 py-1 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceItems.map((item: any, i: number) => (
                            <tr key={i}>
                                <td className="border px-2 py-1">{i + 1}</td>
                                <td className="border px-2 py-1">{item.name}</td>
                                <td className="border px-2 py-1 text-right">{item.quantity}</td>
                                <td className="border px-2 py-1 text-right">{item.unitPrice.toFixed(2)} €</td>
                                <td className="border px-2 py-1 text-right">{item.total.toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 text-sm text-right">
                    <p>Total HT : {totalHT.toFixed(2)} €</p>
                    {tva && <p>TVA ({tva}%) : {totalTVA.toFixed(2)} €</p>}
                    <p className="font-bold">Total TTC : {totalTTC.toFixed(2)} €</p>
                </div>
            </div>
        </div>
    );
}
