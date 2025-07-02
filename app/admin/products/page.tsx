"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/stores/product-store";
import { useCategoryStore } from "@/stores/category-store";
import { useAuthStore } from "@/stores/auth-store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ProductList() {
    const router = useRouter();
    const { user } = useAuthStore();
    const companyId = user?.company?.id ?? "";

    const {
        products,
        fetchProducts,
        toggleProductStatus,
        totalPages,
        page: currentPage,
    } = useProductStore();
    const { categories, fetchCategories } = useCategoryStore();

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<{
        id: string;
        isActive: boolean;
    } | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (companyId) {
            fetchProducts(companyId, {
                page,
                search,
                categoryId: selectedCategory,
            });
            fetchCategories(companyId);
        }
    }, [companyId, page, search, selectedCategory]);

    const exportPDF = () => {
        const doc = new jsPDF();
        const date = new Date().toISOString().split("T")[0];
        doc.text("Liste des produits", 10, 10);
        autoTable(doc, {
            head: [["Nom", "Catégorie", "Prix", "Stock min", "Quantité"]],
            body: products.map((p) => [
                p.name,
                categories.find((c) => c.id === p.categoryId)?.name ?? "",
                `${p.price.toFixed(2)} €`,
                p.stockMin,
                p.quantity,
            ]),
        });
        doc.save(`Liste-produit-${date}.pdf`);
    };

    const confirmToggle = async () => {
        if (!selectedProduct) return;
        try {
            await toggleProductStatus(selectedProduct.id, !selectedProduct.isActive);
            toast.success(
                `Produit ${!selectedProduct.isActive ? "activé" : "désactivé"}`
            );
        } catch {
            toast.error("Erreur lors du changement de statut");
        } finally {
            setSelectedProduct(null);
        }
    };

    return (
        <>
            <div className="p-6 space-y-4 shadow rounded bg-white">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <Input
                        placeholder="Recherche par nom..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full sm:w-1/3"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPage(1);
                        }}
                        className="border rounded px-3 py-2 text-sm"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <Button onClick={exportPDF} className="bg-slate-500 hover:bg-slate-600">
                            Exporter PDF
                        </Button>
                        <Button
                            onClick={() => router.push("/admin/products/create")}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            + Nouveau Produit
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Image</th>
                                <th className="px-4 py-2 text-left">Nom</th>
                                <th className="px-4 py-2 text-left">Catégorie</th>
                                <th className="px-4 py-2 text-left">Prix</th>
                                <th className="px-4 py-2 text-left">Stock Min</th>
                                <th className="px-4 py-2 text-left">Quantité</th>
                                <th className="px-4 py-2 text-left">Statut</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b">
                                    <td className="px-4 py-2">
                                        {product.mainImage ? (
                                            <Image
                                                src={product.mainImage}
                                                alt=""
                                                width={40}
                                                height={40}
                                                className="rounded"
                                            />
                                        ) : (
                                            <span className="text-gray-400">Aucune</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 font-medium">{product.name}</td>
                                    <td className="px-4 py-2">
                                        {categories.find((c) => c.id === product.categoryId)?.name ??
                                            ""}
                                    </td>
                                    <td className="px-4 py-2">{product.price.toFixed(2)} €</td>
                                    <td className="px-4 py-2">{product.stockMin}</td>
                                    <td className="px-4 py-2">{product.quantity}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${product.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {product.isActive ? "Actif" : "Inactif"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 space-x-2">
                                        <Button
                                            className="text-orange-500 hover:text-orange-700"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.push(`/admin/products/${product.id}/edit`)
                                            }
                                        >
                                            Modifier
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                setSelectedProduct({
                                                    id: product.id,
                                                    isActive: product.isActive,
                                                })
                                            }
                                        >
                                            {product.isActive ? "Désactiver" : "Activer"}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <p className="text-center text-gray-500 mt-4">
                            Aucun produit trouvé.
                        </p>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Button
                                key={p}
                                variant={p === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                open={!!selectedProduct}
                onOpenChange={() => setSelectedProduct(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmation</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-700">
                        Voulez-vous vraiment{" "}
                        {selectedProduct?.isActive ? "désactiver" : "activer"} ce produit ?
                    </p>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={confirmToggle}
                            className={selectedProduct?.isActive ? "bg-red-600" : "bg-green-600"}
                        >
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
