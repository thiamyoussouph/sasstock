'use client';

import { useRef } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  invoiceNumber: string;
  emitterName: string;
  emitterAddress: string;
  emitterPhone: string;
  emitterEmail: string;
  clientName: string;
  clientAddress: string;
  date?: string;
  dueDate?: string;
  products: { quantity: number; description: string; unitPrice: number; total: number }[];
  tvaRate: number;
  tvaEnabled: boolean;
  signatureUrl?: string;
  stampUrl?: string;
}

export default function InvoicePreview({
  invoiceNumber,
  emitterName,
  emitterAddress,
  emitterPhone,
  emitterEmail,
  clientName,
  clientAddress,
  date,
  dueDate,
  products,
  tvaRate,
  tvaEnabled,
  signatureUrl,
  stampUrl
}: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const totalHT = products.reduce((acc, p) => acc + p.total, 0);
  const totalTVA = tvaEnabled ? (totalHT * tvaRate) / 100 : 0;
  const totalTTC = totalHT + totalTVA;

  const formatSafeDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '—' : format(d, 'dd MMMM yyyy');
  };

  const handleExportPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff', // Pour éviter l'erreur avec oklch ou transparent
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoiceNumber || 'facture'}.pdf`);
  };

  return (
    <>
      <div
        ref={invoiceRef}
        className="p-6 rounded shadow border text-black bg-white"
        style={{
          color: '#000000',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-extrabold tracking-tight">FACTURE</h2>
          <div className="text-sm text-right">
            <div className="font-semibold uppercase">Facture n° {invoiceNumber}</div>
            <div className="text-gray-600">Date : {formatSafeDate(date)}</div>
            <div className="text-gray-600">Échéance : {formatSafeDate(dueDate)}</div>
          </div>
        </div>

        {/* Émetteur & Client */}
        <div className="flex justify-between text-sm mt-4">
          <div>
            <span className="font-semibold bg-gray-200 px-2 py-1 rounded">Émetteur</span>
            <div className="mt-1 font-bold">{emitterName}</div>
            <div>{emitterAddress}</div>
            <div>{emitterPhone}</div>
            <div>{emitterEmail}</div>
          </div>
          <div className="text-right">
            <span className="font-semibold bg-gray-200 px-2 py-1 rounded">Client</span>
            <div className="mt-1 font-bold">{clientName}</div>
            <div>{clientAddress}</div>
          </div>
        </div>

        {/* Tableau produits */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Quantité</th>
                <th className="px-3 py-2 text-left">Prix Unitaire</th>
                <th className="px-3 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">{item.unitPrice.toFixed(2)} €</td>
                  <td className="px-3 py-2">{item.total.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="text-sm text-right space-y-1 mt-4">
          <div className="flex justify-end gap-4">
            <span className="font-medium">Total HT :</span>
            <span>{totalHT.toFixed(2)} €</span>
          </div>
          {tvaEnabled && (
            <div className="flex justify-end gap-4">
              <span className="font-medium">TVA ({tvaRate}%) :</span>
              <span>{totalTVA.toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-end gap-4 font-bold text-orange-500">
            <span>Total TTC :</span>
            <span>{totalTTC.toFixed(2)} €</span>
          </div>
        </div>

        {/* Signature & Cachet */}
        {(signatureUrl || stampUrl) && (
          <div className="flex gap-12 pt-6 items-center">
            {signatureUrl && (
              <div className="text-sm text-center">
                <img src={signatureUrl} alt="Signature" className="h-20 object-contain mx-auto" />
                <div>Signature</div>
              </div>
            )}
            {stampUrl && (
              <div className="text-sm text-center">
                <img src={stampUrl} alt="Cachet" className="h-20 object-contain mx-auto" />
                <div>Cachet</div>
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        onClick={handleExportPDF}
        className="mt-6 bg-orange-500 hover:bg-orange-600 text-white"
      >
        Télécharger la Facture ⬇
      </Button>
    </>
  );
}
