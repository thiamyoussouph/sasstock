'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/auth-store';
import { useCategoryStore } from '@/stores/category-store';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function CreateProductForm() {
    const { user } = useAuthStore();
    const companyId = user?.company?.id;
    const { categories, fetchCategories } = useCategoryStore();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [priceHalf, setPriceHalf] = useState('');
    const [priceWholesale, setPriceWholesale] = useState('');
    const [unit, setUnit] = useState('');
    const [stockMin, setStockMin] = useState('');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [codeBar, setCodeBar] = useState('');
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [categoryId, setCategoryId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        if (companyId) fetchCategories(companyId);
    }, [companyId, fetchCategories]);

    const handleSubmit = async () => {
        if (!name.trim() || !price || !unit || !categoryId) {
            toast.error('Veuillez remplir les champs obligatoires.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        if (priceHalf) formData.append('priceHalf', priceHalf);
        if (priceWholesale) formData.append('priceWholesale', priceWholesale);
        formData.append('unit', unit);
        if (stockMin) formData.append('stockMin', stockMin);
        if (quantity) formData.append('quantity', quantity);
        if (codeBar) formData.append('codeBar', codeBar);
        if (description) formData.append('description', description);
        if (mainImage) formData.append('mainImage', mainImage);
        formData.append('categoryId', categoryId);
        formData.append('companyId', companyId!);

        setIsLoading(true);
        try {
            const res = await fetch('/api/products/create', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Erreur lors de la création');
            }

            toast.success('Produit créé avec succès');
            setName('');
            setPrice('');
            setPriceHalf('');
            setPriceWholesale('');
            setUnit('');
            setStockMin('');
            setQuantity('');
            setCodeBar('');
            setDescription('');
            setMainImage(null);
            setImagePreview('');
            setCategoryId('');
        } catch (e: unknown) {
            if (e instanceof Error) {
                toast.error(e.message || 'Erreur inconnue');
            } else {
                toast.error('Erreur inconnue');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded shadow space-y-4">
            <h2 className="text-lg font-semibold">Créer un produit</h2>

            {/* Nom + CodeBarre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Nom *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <Label>Code barre</Label>
                    <Input value={codeBar} onChange={(e) => setCodeBar(e.target.value)} />
                </div>
            </div>

            {/* Prix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Prix détail *</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div>
                    <Label>Prix demi-gros</Label>
                    <Input type="number" value={priceHalf} onChange={(e) => setPriceHalf(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Prix gros</Label>
                    <Input type="number" value={priceWholesale} onChange={(e) => setPriceWholesale(e.target.value)} />
                </div>
                <div>
                    <Label>Unité *</Label>
                    <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
                </div>
            </div>

            {/* Stock + Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Stock minimum</Label>
                    <Input type="number" value={stockMin} onChange={(e) => setStockMin(e.target.value)} />
                </div>
                <div>
                    <Label>Quantité initiale</Label>
                    <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
            </div>

            {/* Catégorie */}
            <div>
                <Label>Catégorie *</Label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Description */}
            <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {/* Image */}
            <div>
                <Label>Image principale</Label>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setMainImage(file);
                            setImagePreview(URL.createObjectURL(file));
                        }
                    }}
                />
                {imagePreview && (
                    <div className="mt-2 relative w-fit">
                        <Image
                            src={imagePreview}
                            alt="Aperçu"
                            width={128}
                            height={128}
                            className="object-cover rounded border"
                        />
                        <button
                            onClick={() => {
                                setMainImage(null);
                                setImagePreview('');
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* Submit */}
            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Créer'}
            </Button>
        </div>
    );
}
