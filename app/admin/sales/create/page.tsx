'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useProductStore } from '@/stores/product-store';
import { useCustomerStore } from '@/stores/customer-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSaleStore } from '@/stores/sale-store';
import { toast } from 'react-toastify';
import ProductSearchSelect from '@/components/product/SelectSearchProduit';
import { Trash2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
interface CartItem {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export default function CreateSalePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const companyId = user?.company?.id ?? '';
    const userId = user?.id ?? '';

    const { products, fetchProducts } = useProductStore();
    const { customers, fetchCustomers } = useCustomerStore();
    const { createSale } = useSaleStore();

    const invoiceRef = useRef<HTMLDivElement>(null);
    const codeBarInputRef = useRef<HTMLInputElement>(null);
    const [scannedCode, setScannedCode] = useState('');

    const [items, setItems] = useState<CartItem[]>([]);
    const [customerId, setCustomerId] = useState('');
    const [paymentType, setPaymentType] = useState<'CASH' | 'MOBILE_MONEY' | 'CARD'>('CASH');
    const [saleMode, setSaleMode] = useState<'DETAIL' | 'DEMI_GROS' | 'GROS'>('DETAIL');

    const [priceError, setPriceError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [saleNumber, setSaleNumber] = useState<string | null>(null);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Ticket-${saleNumber || 'recu'}`,
    });

    useEffect(() => {
        if (companyId) {
            fetchProducts(companyId, { limit: 100, page: 1 });
            fetchCustomers(companyId);
        }
    }, [companyId, fetchProducts, fetchCustomers]);

    useEffect(() => {
        codeBarInputRef.current?.focus();
    }, []);

    const handleScanCodeBar = () => {
        const found = products.find(p => p.codeBar === scannedCode.trim());
        if (!found) {
            toast.error('Produit non trouvé.');
        } else {
            handleAddProduct(found);
        }
        setScannedCode('');
        codeBarInputRef.current?.focus();
    };

    const handleAddProduct = (product: Product) => {
        const price = saleMode === 'GROS' ? product.priceWholesale :
            saleMode === 'DEMI_GROS' ? product.priceHalf : product.price;

        if (price == null) {
            toast.error(`Ce produit n'a pas de prix pour le mode : ${saleMode}`);
            setPriceError(true);
            return;
        }

        setPriceError(false);

        const exists = items.find(i => i.productId === product.id);
        if (exists) {
            setItems(items.map(i =>
                i.productId === product.id
                    ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
                    : i
            ));
        } else {
            setItems([...items, {
                productId: product.id,
                name: product.name,
                quantity: 1,
                unitPrice: price,
                total: price,
            }]);
        }
    };

    const handleRemoveProduct = (id: string) => {
        setItems(items.filter(i => i.productId !== id));
    };

    const handleQuantityChange = (id: string, qty: number) => {
        setItems(items.map(i =>
            i.productId === id
                ? { ...i, quantity: qty, total: qty * i.unitPrice }
                : i
        ));
    };

    const total = items.reduce((acc, i) => acc + i.total, 0);

    const handleSubmit = async () => {
        if (!items.length) return toast.error("Veuillez ajouter au moins un produit.");
        setSubmitting(true);

        try {
            const payload = {
                companyId,
                userId,
                customerId: customerId || undefined,
                paymentType,
                saleMode,
                status: 'CONFIRMED',
                total,
                saleItems: items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    total: i.total,
                })),
                payments: [{
                    amount: total,
                    montantRecu: total,
                    monnaieRendue: 0,
                    method: paymentType,
                }],
            };

            const res = await createSale(payload);
            toast.success('Vente enregistrée');
            setSaleNumber(res.numberSale || null);

            setTimeout(() => handlePrint?.(), 300);
            setTimeout(() => router.push('/admin/sales'), 1000);

        } catch (err: unknown) {
            console.error('Erreur création vente :', err);
            toast.error((err as Error).message || 'Erreur serveur');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-white rounded shadow grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <h1 className="text-xl font-semibold mb-4">Nouvelle vente</h1>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Client</Label>
                        <select className="w-full border px-3 py-2 rounded" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                            <option value="">Client passager</option>
                            {customers.map((c: Customer) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Mode de vente</Label>
                        <select
                            className="w-full border px-3 py-2 rounded"
                            value={saleMode}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setSaleMode(e.target.value as 'DETAIL' | 'DEMI_GROS' | 'GROS')
                            }
                        >
                            <option value="DETAIL">Détail</option>
                            <option value="DEMI_GROS">Demi-gros</option>
                            <option value="GROS">Gros</option>
                        </select>
                    </div>

                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                        <Label>Paiement</Label>
                        <select
                            className="w-full border px-3 py-2 rounded"
                            value={paymentType}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setPaymentType(e.target.value as 'CASH' | 'MOBILE_MONEY' | 'CARD')
                            }
                        >
                            <option value="CASH">Espèces</option>
                            <option value="MOBILE_MONEY">Mobile Money</option>
                            <option value="CARD">Carte</option>
                        </select>
                    </div>
                </div>


                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                        <Label>Scanner un produit</Label>
                        <Input
                            ref={codeBarInputRef}
                            value={scannedCode}
                            onChange={(e) => setScannedCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScanCodeBar()}
                            placeholder="Code-barres"
                            autoFocus
                        />
                    </div>
                    <div>
                        <ProductSearchSelect
                            products={products}
                            onSelect={(id) => {
                                const found = products.find(p => p.id === id);
                                if (found) handleAddProduct(found);
                            }}
                        />
                    </div>
                </div>

                {priceError && <p className="text-red-500 text-sm">Un ou plusieurs produits n&apos;ont pas de prix.</p>}

                {items.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left">Produit</th>
                                    <th className="p-2 text-right">Qté</th>
                                    <th className="p-2 text-right">PU</th>
                                    <th className="p-2 text-right">Total</th>
                                    <th className="p-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2">{item.name}</td>
                                        <td className="p-2 text-right">
                                            <Input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))} className="w-20" />
                                        </td>
                                        <td className="p-2 text-right">{item.unitPrice.toFixed(2)}</td>
                                        <td className="p-2 text-right">{item.total.toFixed(2)}</td>
                                        <td className="p-2 text-center">
                                            <Button size="icon" variant="ghost" onClick={() => handleRemoveProduct(item.productId)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-right font-bold mt-2">Total : {total.toFixed(2)} €</p>
                    </div>
                )}

                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={submitting || priceError || items.length === 0}>
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
            </div>

            {/* Ticket à imprimer */}
            <div ref={invoiceRef} className="bg-white border rounded p-4 print:w-full">
                <h2 className="text-lg font-semibold border-b pb-2 mb-2">Ticket de caisse : {saleNumber}</h2>
                <p className="text-sm">Entreprise : {user?.company?.name}</p>
                <p className="text-sm">Caissier : {user?.name}</p>
                <p className="text-sm mb-4">Date : {new Date().toLocaleString()}</p>

                <table className="w-full text-sm">
                    <thead className="border-b">
                        <tr>
                            <th className="text-left py-1">Produit</th>
                            <th className="text-right py-1">Qté</th>
                            <th className="text-right py-1">PU</th>
                            <th className="text-right py-1">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.name}</td>
                                <td className="text-right">{item.quantity}</td>
                                <td className="text-right">{item.unitPrice.toFixed(2)}</td>
                                <td className="text-right">{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <hr className="my-2" />
                <p className="text-right font-semibold">Total à payer : {total.toFixed(2)} €</p>
                <p className="text-center mt-4 text-xs text-gray-500">Merci pour votre achat !</p>
            </div>
        </div>
    );
}
