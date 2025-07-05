'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import InvoicePreview from './InvoicePreview';
import { useAuthStore } from '@/stores/auth-store';
import { useInvoiceStore } from '@/stores/invoice-store';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';

// Temporaire : à remplacer par une vraie liste des clients depuis API
const clients = [
    { id: '1', name: 'Client A' },
    { id: '2', name: 'Client B' },
];

type Product = {
    quantity: number;
    description: string;
    unitPrice: number;
    total: number;
};

export default function CreateInvoiceForm() {
    const { user } = useAuthStore();
    const company = user?.company;
    const { createInvoice } = useInvoiceStore();
    const router = useRouter();


    const [products, setProducts] = useState<Product[]>([
        { quantity: 1, description: '', unitPrice: 0, total: 0 },
    ]);

    const [customerId, setCustomerId] = useState<string>('');
    const [invoiceTitle, setInvoiceTitle] = useState('');
    const [tvaRate, setTvaRate] = useState(20);
    const [date, setDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<'unpaid' | 'paid'>('unpaid');
    const [tvaEnabled, setTvaEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    const emitterName = company?.name || '';
    const emitterAddress = company?.address || '';
    const emitterPhone = company?.phone || '';
    const emitterEmail = company?.email || '';

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Ticket-${invoiceTitle || 'recu'}`,
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

    const handleProductChange = (
        index: number,
        key: keyof Product,
        value: string | number
    ) => {
        const updated = [...products];
        const parsedValue =
            key === 'quantity' || key === 'unitPrice' ? Number(value) : value;

        updated[index][key] = parsedValue as never;
        updated[index].total =
            Number(updated[index].quantity) * Number(updated[index].unitPrice);

        setProducts(updated);
    };

    const totalHT = products.reduce((acc, p) => acc + p.total, 0);
    const totalTVA = tvaEnabled ? (totalHT * tvaRate) / 100 : 0;
    const totalTTC = totalHT + totalTVA;


    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            if (!company?.id) {
                toast.error('Entreprise introuvable.');
                return;
            }

            if (!invoiceTitle.trim()) {
                toast.error('Le nom de la facture est obligatoire.');
                return;
            }

            if (!date || !dueDate) {
                toast.error('Les dates sont obligatoires.');
                return;
            }

            if (products.length === 0 || products.some(p => !p.description.trim())) {
                toast.error('Veuillez ajouter au moins un produit avec une description.');
                return;
            }

            await createInvoice({
                companyId: company.id,
                customerId,
                title: invoiceTitle,
                status,
                tva: tvaEnabled ? tvaRate : 0,
                issueDate: new Date(date),
                dueDate: new Date(dueDate),
                comment: '',
                note: '',
                invoiceItems: products.map((p) => ({
                    name: p.description,
                    quantity: p.quantity,
                    unitPrice: p.unitPrice,
                })),
            });

            toast.success('Facture créée avec succès !');
            setTimeout(() => {
                handlePrint?.();
            }, 300);
            router.push('/admin/invoices');
        } catch (error) {
            console.error('Erreur création facture', error);
            toast.error("Une erreur s'est produite lors de la création.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
                <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Nom de la facture</label>
                        <Input
                            placeholder="Ex: Facture n°001"
                            value={invoiceTitle}
                            onChange={(e) => setInvoiceTitle(e.target.value)}
                        />
                    </div>

                    <div className="w-full md:w-40">
                        <label className="block text-sm font-medium mb-1">Statut</label>
                        <Select value={status} onValueChange={(v) => setStatus(v as 'unpaid' | 'paid')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unpaid">En attente</SelectItem>
                                <SelectItem value="paid">Payée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-auto">
                        <Button
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder'}
                        </Button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <label className="block text-sm font-medium mb-1">Client</label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <label className="block text-sm font-medium mb-1">Date de facture</label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

                    <label className="block text-sm font-medium mb-1 mt-4">Date d&apos;échéance</label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-bold text-lg mb-4">Résumé des Totaux</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Total HT :</span>
                            <span>{totalHT.toFixed(2)} €</span>
                        </div>
                        {tvaEnabled && (
                            <div className="flex justify-between">
                                <span>TVA ({tvaRate}%) :</span>
                                <span>{totalTVA.toFixed(2)} €</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold">
                            <span>Total TTC :</span>
                            <span>{totalTTC.toFixed(2)} €</span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-sm font-medium">Activer la TVA</label>
                        <Switch checked={tvaEnabled} onCheckedChange={setTvaEnabled} />

                        {tvaEnabled && (
                            <div className="mt-2">
                                <label className="block text-sm font-medium mb-1">Taux TVA (%)</label>
                                <Input
                                    type="number"
                                    value={tvaRate}
                                    onChange={(e) => setTvaRate(Number(e.target.value))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white p-4 rounded shadow space-y-4">
                    <h3 className="font-bold text-lg">Produits / Services</h3>

                    {products.map((p, index) => (
                        <div key={index} className="grid grid-cols-6 gap-2 items-center">
                            <Input
                                type="number"
                                placeholder="Quantité"
                                value={p.quantity}
                                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                            />
                            <Input
                                placeholder="Description"
                                value={p.description}
                                onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                                className="col-span-2"
                            />
                            <Input
                                type="number"
                                placeholder="Prix unitaire"
                                value={p.unitPrice}
                                onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                            />
                            <div className="text-right font-semibold">{p.total.toFixed(2)} €</div>
                            <button
                                type="button"
                                onClick={() => setProducts(products.filter((_, i) => i !== index))}
                                className="text-red-600 hover:text-red-800"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}

                    <Button className='bg-blue-500 hover:bg-blue-600' onClick={() => setProducts([...products, { quantity: 1, description: '', unitPrice: 0, total: 0 }])}>
                        + Ajouter un produit
                    </Button>
                </div>

                <InvoicePreview
                    invoiceNumber={invoiceTitle}
                    emitterName={emitterName}
                    emitterEmail={emitterEmail}
                    emitterPhone={emitterPhone}
                    emitterAddress={emitterAddress}
                    clientName={''}
                    clientAddress={''}
                    date={date}
                    dueDate={dueDate}
                    products={products}
                    tvaRate={tvaRate}
                    tvaEnabled={tvaEnabled}
                    ref={invoiceRef}
                />
            </div>
        </div>
    );
}
