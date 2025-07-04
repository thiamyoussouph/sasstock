'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2, Loader2 } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'react-toastify';
import InvoicePreview from '@/components/invoices/InvoicePreview';
import { Label } from '@/components/ui/label';

// À remplacer plus tard par des données dynamiques
const clients = [
    { id: '1', name: 'Client A' },
    { id: '2', name: 'Client B' },
];

interface InvoiceItem {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface ProductForm {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface InvoiceData {
    title: string;
    customerId: string;
    issueDate: string;
    dueDate: string;
    status: 'paid' | 'unpaid';
    tva: number;
    invoiceItems: InvoiceItem[];
    customer?: {
        name?: string;
        address?: string;
    };
}

export default function EditInvoiceForm() {
    const { user } = useAuthStore();
    const company = user?.company;
    const router = useRouter();
    const { id } = useParams();

    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [invoiceTitle, setInvoiceTitle] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [date, setDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<'paid' | 'unpaid'>('unpaid');
    const [tvaEnabled, setTvaEnabled] = useState(true);
    const [tvaRate, setTvaRate] = useState(20);
    const [products, setProducts] = useState<ProductForm[]>([]);

    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchInvoice() {
            try {
                const res = await fetch(`/api/invoices/details/${id}`);
                const data: InvoiceData = await res.json();
                setInvoice(data);
                setInvoiceTitle(data.title);
                setCustomerId(data.customerId);
                setDate(data.issueDate?.substring(0, 10));
                setDueDate(data.dueDate?.substring(0, 10));
                setStatus(data.status);
                setTvaEnabled(data.tva > 0);
                setTvaRate(data.tva);
                setProducts(
                    data.invoiceItems.map((item) => ({
                        description: item.name,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total,
                    }))
                );
            } catch {
                toast.error('Erreur de chargement de la facture');
            } finally {
                setLoading(false);
            }
        }

        fetchInvoice();
    }, [id]);

    const handleProductChange = (
        index: number,
        key: keyof ProductForm,
        value: string | number
    ) => {
        const updated: ProductForm[] = [...products];

        if (key === 'quantity' || key === 'unitPrice' || key === 'total') {
            updated[index][key] = Number(value) as ProductForm[typeof key];
        } else {
            updated[index][key] = value as ProductForm[typeof key];
        }

        updated[index].total = updated[index].quantity * updated[index].unitPrice;
        setProducts(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/invoices/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: invoiceTitle,
                    customerId,
                    issueDate: new Date(date),
                    dueDate: new Date(dueDate),
                    status,
                    tva: tvaEnabled ? tvaRate : 0,
                    invoiceItems: products.map((p) => ({
                        name: p.description,
                        quantity: p.quantity,
                        unitPrice: p.unitPrice,
                        total: p.total,
                    })),
                }),
            });

            if (!res.ok) throw new Error();
            toast.success('Facture modifiée avec succès');
            router.push('/admin/invoices');
        } catch {
            toast.error('Erreur lors de la modification');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div className="space-y-4 p-6 rounded shadow border text-black bg-white">
                <Label>Nom facture</Label>
                <Input
                    value={invoiceTitle}
                    onChange={(e) => setInvoiceTitle(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Label>TVA</Label>
                            <Switch
                                checked={tvaEnabled}
                                onCheckedChange={setTvaEnabled}
                            />
                        </div>
                        {tvaEnabled && (
                            <Input
                                type="number"
                                value={tvaRate}
                                onChange={(e) => setTvaRate(Number(e.target.value))}
                            />
                        )}
                    </div>

                    <div>
                        <Label>Client</Label>
                        <Select value={customerId} onValueChange={setCustomerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Client" />
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Date d&apos;échéance</Label>
                        <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>

                <Label>Liste Produits</Label>
                {products.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <Input
                            value={p.description}
                            onChange={(e) =>
                                handleProductChange(i, 'description', e.target.value)
                            }
                            placeholder="Description"
                        />
                        <Input
                            type="number"
                            value={p.quantity}
                            onChange={(e) =>
                                handleProductChange(i, 'quantity', e.target.value)
                            }
                            placeholder="Qté"
                        />
                        <Input
                            type="number"
                            value={p.unitPrice}
                            onChange={(e) =>
                                handleProductChange(i, 'unitPrice', e.target.value)
                            }
                            placeholder="Prix unitaire"
                        />
                        <div className="w-20 text-sm">{p.total.toFixed(2)} €</div>
                        <button
                            className="text-red-600"
                            onClick={() =>
                                setProducts(products.filter((_, idx) => idx !== i))
                            }
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                <div className="flex items-center gap-2 mt-4">
                    <Button
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() =>
                            setProducts([
                                ...products,
                                { description: '', quantity: 1, unitPrice: 0, total: 0 },
                            ])
                        }
                    >
                        + Produit
                    </Button>

                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            'Sauvegarder'
                        )}
                    </Button>
                </div>
            </div>

            <div>
                <InvoicePreview
                    invoiceNumber={invoiceTitle}
                    emitterName={company?.name || ''}
                    emitterEmail={company?.email || ''}
                    emitterPhone={company?.phone || ''}
                    emitterAddress={company?.address || ''}
                    clientName={invoice?.customer?.name || ''}
                    clientAddress={invoice?.customer?.address || ''}
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
