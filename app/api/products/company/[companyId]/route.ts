import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    context: { params: { companyId: string } }
) {
    try {
        const { companyId } = context.params;

        const products = await prisma.product.findMany({
            where: { companyId },
            include: { category: true },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
