import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/stores/product-store";
import { Product } from "@/types/product";

export function ToggleProductStatusDialog({ product }: { product: Product }) {
    const toggleProductStatus = useProductStore((s) => s.toggleProductStatus);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={product.isActive ? "outline" : "default"}>
                    {product.isActive ? "Désactiver" : "Activer"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <p className="text-sm mb-4">
                    Voulez-vous vraiment {product.isActive ? "désactiver" : "activer"} ce produit ?
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={async () => {
                            await toggleProductStatus(product.id, !product.isActive);
                        }}
                        className={product.isActive ? "bg-red-600" : "bg-green-600"}
                    >
                        Confirmer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
