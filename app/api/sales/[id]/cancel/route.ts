import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(_req: Request, { params }: { params: { id: string } }) {
    const saleId = params.id;

    try {
        // 1. Vérifier si la vente existe
        const sale = await prisma.sale.findUnique({
            where: { id: saleId },
            include: {
                saleItems: true,
                payments: true,
            },
        });

        if (!sale) {
            return NextResponse.json({ message: 'Vente introuvable' }, { status: 404 });
        }

        // 2. Restaurer les stocks
        for (const item of sale.saleItems) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    quantity: {
                        increment: item.quantity, // Remet les produits
                    },
                },
            });
        }

        // 3. Supprimer les paiements liés
        await prisma.payment.deleteMany({
            where: { saleId },
        });

        // 4. Mettre à jour la vente (statut)
        const cancelled = await prisma.sale.update({
            where: { id: saleId },
            data: {
                status: 'CANCELLED',
            },
        });

        return NextResponse.json(cancelled);
    } catch (error) {
        console.error('Erreur lors de l’annulation de la vente :', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
