'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import InvoicePreview from './InvoicePreview';
import { useAuthStore } from '@/stores/auth-store';


type Product = {
    quantity: number;
    description: string;
    unitPrice: number;
    total: number;
};

export default function CreateInvoiceForm() {
    const { user } = useAuthStore();
    const company = user?.company;

    const [products, setProducts] = useState<Product[]>([
        { quantity: 1, description: '', unitPrice: 0, total: 0 },
    ]);

    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [emitterName, setEmitterName] = useState('');
    const [emitterAddress, setEmitterAddress] = useState('');
    const [emitterPhone, setEmitterPhone] = useState('');
    const [emitterEmail, setEmitterEmail] = useState('');
    const [tvaRate, setTvaRate] = useState(20);
    const [date, setDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('pending');
    const [tvaEnabled, setTvaEnabled] = useState(true);
    const [invoiceTitle, setInvoiceTitle] = useState('');

    useEffect(() => {
        if (company) {
            setEmitterName(company.name || '');
            setEmitterAddress(company.address || '');
            setEmitterPhone(company.phone || '');
            setEmitterEmail(company.email || '');
        }
    }, [company]);

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
    const totalTVA = (totalHT * tvaRate) / 100;
    const totalTTC = totalHT + totalTVA;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Bloc gauche */}
            <div className="space-y-4">
                {/* Statut et sauvegarde */}
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
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="paid">Payée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-auto">
                        <Button className="w-full md:w-auto">Sauvegarder</Button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h3 className="font-bold text-lg mb-4">Résumé des Totaux</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Total Hors Taxes :</span>
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

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Activer la TVA</label>
                            <Switch checked={tvaEnabled} onCheckedChange={setTvaEnabled} />
                        </div>

                        {tvaEnabled && (
                            <div>
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
                <div className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                            Date de la facture
                        </label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                            Date d'échéance
                        </label>
                        <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>
                {/* Émetteur */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow space-y-2">
                    <h3 className="font-bold text-lg mb-4">Émetteur</h3>
                    <Input
                        placeholder="Nom de l'entreprise"
                        value={emitterName}
                        readOnly
                        className="opacity-70 cursor-not-allowed"
                    />
                    <Textarea
                        placeholder="Adresse"
                        value={emitterAddress}
                        readOnly
                        className="opacity-70 cursor-not-allowed"
                    />
                    <Input
                        placeholder="Téléphone"
                        value={emitterPhone}
                        readOnly
                        className="opacity-70 cursor-not-allowed"
                    />
                    <Input
                        placeholder="Email"
                        value={emitterEmail}
                        readOnly
                        className="opacity-70 cursor-not-allowed"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h3 className="font-bold text-lg mb-4">Client</h3>
                    <Input
                        placeholder="Nom du client"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                    />
                    <Textarea
                        placeholder="Adresse"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                    />
                </div>


            </div>

            <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow space-y-4">
                    <h3 className="font-bold text-lg">Produits / Services</h3>

                    {products.map((p, index) => (
                        <div key={index} className="grid grid-cols-6 gap-2 items-center">
                            <Input
                                type="number"
                                placeholder="Quantité"
                                value={p.quantity}
                                onChange={(e) =>
                                    handleProductChange(index, 'quantity', e.target.value)
                                }
                            />
                            <Input
                                placeholder="Description"
                                value={p.description}
                                onChange={(e) =>
                                    handleProductChange(index, 'description', e.target.value)
                                }
                                className="col-span-2"
                            />
                            <Input
                                type="number"
                                placeholder="Prix unitaire"
                                value={p.unitPrice}
                                onChange={(e) =>
                                    handleProductChange(index, 'unitPrice', e.target.value)
                                }
                            />
                            <div className="text-right font-semibold">
                                {p.total.toFixed(2)} €
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setProducts(products.filter((_, i) => i !== index))
                                }
                                className="text-red-600 hover:text-red-800"
                                title="Supprimer"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    <div className="pt-2">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() =>
                                setProducts([
                                    ...products,
                                    { quantity: 1, description: '', unitPrice: 0, total: 0 },
                                ])
                            }
                        >
                            + Ajouter
                        </Button>
                    </div>
                </div>
                <InvoicePreview
                    invoiceNumber={invoiceTitle}
                    emitterName={emitterName}
                    emitterEmail={emitterEmail}
                    emitterPhone={emitterPhone}
                    emitterAddress={emitterAddress}
                    clientName={clientName}
                    clientAddress={clientAddress}
                    date={date}
                    dueDate={dueDate}
                    products={products}
                    tvaRate={tvaRate}
                    tvaEnabled={tvaEnabled}
                />
            </div>
        </div>
    );
}
