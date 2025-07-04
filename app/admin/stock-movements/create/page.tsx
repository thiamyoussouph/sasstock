'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useProductStore } from '@/stores/product-store';
import { useStockMovementStore } from '@/stores/stock-movement-store';
import { toast } from 'react-toastify';
import ProductSearchSelect from '@/components/product/SelectSearchProduit';
import { Product } from '@/types/product';

interface StockMovementItem {
    productId: string;
    name: string;
    quantity: number;
    purchasePrice: number;
}

export default function CreateStockMovementForm() {
    const { user } = useAuthStore();
    const companyId = user?.company?.id || '';
    const { products, fetchProducts } = useProductStore();
    const { createMovement } = useStockMovementStore();

    const codeBarInputRef = useRef<HTMLInputElement>(null);

    const [type, setType] = useState('ENTREE');
    const [description, setDescription] = useState('');
    const [scannedCode, setScannedCode] = useState('');
    const [items, setItems] = useState<StockMovementItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (companyId) fetchProducts(companyId);
    }, [companyId, fetchProducts]);

    useEffect(() => {
        codeBarInputRef.current?.focus();
    }, []);

    const handleAddProduct = (product: Product) => {
        const exists = items.find(i => i.productId === product.id);
        if (exists) {
            setItems(items.map(i =>
                i.productId === product.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ));
        } else {
            setItems([
                ...items,
                {
                    productId: product.id,
                    name: product.name,
                    quantity: 1,
                    purchasePrice: product.purchasePrice || 0,
                },
            ]);
        }
    };

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

    const handleSelectProduct = (productId: string) => {
        const found = products.find(p => p.id === productId);
        if (found) {
            handleAddProduct(found);
        }
    };

    const handleSubmit = async () => {
        if (!companyId || items.length === 0) {
            toast.error('Ajoutez au moins un produit.');
            return;
        }

        setLoading(true);
        try {
            await createMovement({
                companyId,
                type: type as 'ENTREE' | 'SORTIE' | 'REAPPROVISIONNEMENT' | 'VENTE' | 'INVENTAIRE',
                description,
                items: items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    purchasePrice: i.purchasePrice,
                })),
            });
            toast.success('Mouvement enregistré');
            setItems([]);
            setDescription('');
            setType('ENTREE');
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold">Nouveau Mouvement</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Type de mouvement</label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="ENTREE">Entrée</option>
                        <option value="SORTIE">Sortie</option>
                        <option value="REAPPROVISIONNEMENT">Réapprovisionnement</option>
                        <option value="VENTE">Vente</option>
                        <option value="INVENTAIRE">Inventaire</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Description (facultatif)</label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Scanner un produit</label>
                    <Input
                        ref={codeBarInputRef}
                        value={scannedCode}
                        onChange={(e) => setScannedCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScanCodeBar()}
                        placeholder="Code-barres"
                    />
                </div>
                <div>
                    <ProductSearchSelect
                        products={products}
                        onSelect={handleSelectProduct}
                    />
                </div>
            </div>

            <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Produits ajoutés</h4>
                {items.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun produit ajouté</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-2">Nom</th>
                                <th className="text-left p-2">Quantité</th>
                                <th className="text-left p-2">Prix Achat</th>
                                <th className="text-left p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i}>
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const copy = [...items];
                                                copy[i].quantity = parseInt(e.target.value) || 0;
                                                setItems(copy);
                                            }}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            value={item.purchasePrice}
                                            onChange={(e) => {
                                                const copy = [...items];
                                                copy[i].purchasePrice = parseFloat(e.target.value) || 0;
                                                setItems(copy);
                                            }}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                                        >
                                            Supprimer
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
            >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Enregistrer le mouvement'}
            </Button>
        </div>
    );
}
