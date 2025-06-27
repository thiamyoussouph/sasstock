"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProductStore } from "@/stores/product-store";
import { useCategoryStore } from "@/stores/category-store";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "react-toastify";

export default function EditProductPage() {
    const router = useRouter();
    const id = useParams().id as string;

    if (!id) {
        toast.error("ID produit introuvable");
        return;
    }
    const { user } = useAuthStore();
    const companyId = user?.company?.id ?? "";
    const { updateProduct, fetchProducts, products } = useProductStore();
    const { categories, fetchCategories } = useCategoryStore();

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState("");
    const [codeBar, setCodeBar] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [priceHalf, setPriceHalf] = useState("");
    const [priceWholesale, setPriceWholesale] = useState("");
    const [unit, setUnit] = useState("");
    const [stockMin, setStockMin] = useState("");
    const [quantity, setQuantity] = useState("");
    const [categoryId, setCategoryId] = useState("");

    useEffect(() => {
        if (companyId) fetchCategories(companyId);
    }, [companyId]);

    useEffect(() => {
        fetchProducts(companyId).then(() => {
            const product = products.find((p) => p.id === id);
            if (product) {
                setName(product.name);
                setCodeBar(product.codeBar || "");
                setDescription(product.description || "");
                setPrice(product.price.toString());
                setPriceHalf(product.priceHalf?.toString() || "");
                setPriceWholesale(product.priceWholesale?.toString() || "");
                setUnit(product.unit);
                setStockMin(product.stockMin.toString());
                setQuantity(product.quantity.toString());
                setCategoryId(product.categoryId || "");
            }
            setLoading(false);
        });
    }, [id, companyId]);

    const handleSave = async () => {
        if (!name.trim() || !price || !unit) {
            toast.error("Champs obligatoires manquants.");
            return;
        }

        setIsSaving(true);
        try {
            await updateProduct({
                id,
                name,
                codeBar,
                description,
                price: parseFloat(price),
                priceHalf: priceHalf ? parseFloat(priceHalf) : undefined,
                priceWholesale: priceWholesale ? parseFloat(priceWholesale) : undefined,
                unit,
                stockMin: parseInt(stockMin),
                quantity: parseInt(quantity),
                categoryId,
            });

            toast.success("Produit modifié avec succès");
            router.push("/admin/products");
        } catch (e) {
            toast.error("Erreur lors de la modification");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <p className="p-6">Chargement...</p>;

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-4">
            <h2 className="text-xl font-bold">Modifier le produit</h2>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Stock minimum</Label>
                    <Input type="number" value={stockMin} onChange={(e) => setStockMin(e.target.value)} />
                </div>
                <div>
                    <Label>Quantité</Label>
                    <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
            </div>

            <div>
                <Label>Catégorie</Label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="">Aucune</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : "Enregistrer"}
            </Button>
        </div>
    );
}
