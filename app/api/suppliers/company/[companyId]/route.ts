// Route: /api/suppliers/company/[companyId]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    _req: Request,
    { params }: { params: { companyId: string } }
) {
    try {
        const suppliers = await prisma.supplier.findMany({
            where: { companyId: params.companyId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(suppliers);
    } catch (error) {
        console.error('Erreur chargement fournisseurs:', error);
        return NextResponse.json(
            { message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
