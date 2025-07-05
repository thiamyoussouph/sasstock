import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ companyId: string }> } // <✅ c’est bien ici que `params` est accessible
) {
    try {
        const { companyId } = (await context.params);

        const customers = await prisma.customer.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
