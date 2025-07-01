import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const sale = await prisma.sale.findUnique({
            where: { id: params.id },
            include: {
                customer: true,
                user: true,
                saleItems: { include: { product: true } },
                payments: true,
            },
        });

        if (!sale) {
            return NextResponse.json({ message: 'Vente non trouvée' }, { status: 404 });
        }

        return NextResponse.json(sale);
    } catch (error) {
        console.error('Erreur récupération vente :', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
