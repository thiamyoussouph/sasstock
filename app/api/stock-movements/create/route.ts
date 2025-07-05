// app/api/stock-movements/create/route.ts
import { prisma } from "@/lib/prisma";
import { StockType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type MovementItemInput = {
    productId: string;
    quantity: number;
    purchasePrice: number;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { companyId, type, description, createdBy, items }: {
            companyId: string;
            type: string;
            description?: string;
            createdBy?: string;
            items: MovementItemInput[];
        } = body;

        // 1. Crée le mouvement avec ses items
        const movement = await prisma.stockMovement.create({
            data: {
                companyId,
                type: type as StockType,
                description,
                createdBy,
                items: {
                    create: items.map((item) => ({
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

        // 2. Met à jour la quantité des produits en fonction du type
        for (const item of items) {
            const currentProduct = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { quantity: true },
            });

            if (!currentProduct) continue;

            const delta = type === "ENTREE"
                ? item.quantity
                : type === "SORTIE"
                    ? -item.quantity
                    : 0;

            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    quantity: currentProduct.quantity + delta,
                },
            });
        }

        return NextResponse.json(movement);
    } catch (error) {
        console.error("Erreur création mouvement:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
