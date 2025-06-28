import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await req.json();
        const { type, description, createdBy, items } = body;

        // 1. Récupère les anciens items
        const previousItems = await prisma.stockMovementItem.findMany({
            where: { stockMovementId: id },
        });

        // 2. Regroupe les anciennes quantités par produit
        const previousMap = new Map<string, number>();
        for (const item of previousItems) {
            previousMap.set(item.productId, item.quantity);
        }

        // 3. Supprime les anciens items
        await prisma.stockMovementItem.deleteMany({ where: { stockMovementId: id } });

        // 4. Met à jour le mouvement avec les nouveaux items
        const updatedMovement = await prisma.stockMovement.update({
            where: { id },
            data: {
                type,
                description,
                createdBy,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        purchasePrice: item.purchasePrice,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        // 5. Appliquer le delta par produit
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { quantity: true },
            });
            if (!product) continue;

            const oldQty = previousMap.get(item.productId) || 0;
            const newQty = item.quantity;

            let delta = 0;

            if (type === "ENTREE") {
                delta = newQty - oldQty;
            } else if (type === "SORTIE") {
                delta = oldQty - newQty;
                delta = -delta; // car sortie => on enlève
            }

            const finalQty = product.quantity + delta;

            if (finalQty < 0) {
                return NextResponse.json(
                    { message: `Stock insuffisant pour le produit ID ${item.productId}` },
                    { status: 400 }
                );
            }

            await prisma.product.update({
                where: { id: item.productId },
                data: { quantity: finalQty },
            });
        }

        return NextResponse.json(updatedMovement);
    } catch (error) {
        console.error("Erreur update mouvement:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
