'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useProductStore } from '@/stores/product-store';
import { useStockMovementStore } from '@/stores/stock-movement-store';
import { toast } from 'react-toastify';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProductSearchSelect from '@/components/product/SelectSearchProduit';
import { StockMovementType } from '@/types/stock-movements';
import { Product } from '@/types/product';

interface MovementItem {
    productId: string;
    name: string;
    quantity: number;
    purchasePrice: number;
}

export default function EditStockMovement() {
    const router = useRouter();
    const { id } = useParams();
    const codeBarInputRef = useRef<HTMLInputElement>(null);

    const { user } = useAuthStore();
    const companyId = user?.company?.id ?? '';
    const { products, fetchProducts } = useProductStore();
    const { updateMovement, movements, fetchMovements } = useStockMovementStore();

    const [description, setDescription] = useState('');
    const [type, setType] = useState<StockMovementType>('ENTREE');
    const [items, setItems] = useState<MovementItem[]>([]);
    const [scannedCode, setScannedCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (companyId) {
            fetchProducts(companyId);
            fetchMovements(companyId);
        }
    }, [companyId, fetchProducts, fetchMovements]);

    useEffect(() => {
        const movement = movements.find((m) => m.id === id);
        if (movement) {
            setDescription(movement.description ?? '');
            setType(movement.type);
            const loadedItems = movement.items.map((item) => {
                const p = products.find((pr) => pr.id === item.productId);
                return {
                    productId: item.productId,
                    name: p?.name ?? '',
                    quantity: item.quantity,
                    purchasePrice: item.purchasePrice || 0,
                };
            });
            setItems(loadedItems);
        }
    }, [movements, id, products]);

    const handleAddProduct = (product: Product) => {
        const exists = items.find((i) => i.productId === product.id);
        if (exists) {
            setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setItems([...items, {
                productId: product.id,
                name: product.name,
                quantity: 1,
                purchasePrice: product.purchasePrice || 0
            }]);
        }
    };

    const handleScanCodeBar = () => {
        const found = products.find(p => p.codeBar === scannedCode);
        if (found) handleAddProduct(found);
        else toast.error('Produit non trouvé.');
        setScannedCode('');
    };

    const handleSelectProduct = (productId: string) => {
        const found = products.find(p => p.id === productId);
        if (found) handleAddProduct(found);
    };

    const handleSubmit = async () => {
        if (!items.length) return toast.error("Aucun produit");
        setLoading(true);
        try {
            await updateMovement(id as string, {
                type,
                description,
                createdBy: user?.name,
                items: items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    purchasePrice: i.purchasePrice,
                }))
            });
            toast.success('Mouvement modifié avec succès');
            router.push('/admin/stock-movements');
        } catch (e) {
            toast.error((e as Error).message || 'Erreur modification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">Modifier le mouvement de stock</h1>
                <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push('/admin/stock-movements')}>
                    <ArrowLeft size={16} /> Retour à la liste
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Type *</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as StockMovementType)}
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="ENTREE">Entrée</option>
                        <option value="SORTIE">Sortie</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium">Scanner un code-barres</label>
                <Input
                    ref={codeBarInputRef}
                    autoFocus
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScanCodeBar()}
                    placeholder="Code-barres"
                />
            </div>

            <ProductSearchSelect products={products} onSelect={handleSelectProduct} />

            <table className="w-full text-sm mt-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="text-left p-2">Produit</th>
                        <th className="text-left p-2">Quantité</th>
                        <th className="text-left p-2">Prix achat</th>
                        <th className="text-left p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} className="border-b">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">
                                <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setItems(items.map((it, i) => i === index ? { ...it, quantity: val } : it));
                                    }}
                                />
                            </td>
                            <td className="p-2">
                                <Input
                                    type="number"
                                    value={item.purchasePrice}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setItems(items.map((it, i) => i === index ? { ...it, purchasePrice: val } : it));
                                    }}
                                />
                            </td>
                            <td className="p-2">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                                >
                                    Supprimer
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Button onClick={handleSubmit} disabled={loading} className="mt-4 bg-green-600 hover:bg-green-700">
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Enregistrer les modifications'}
            </Button>
        </div>
    );
}
