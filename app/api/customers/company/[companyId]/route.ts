// app/api/customers/company/[companyId]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { companyId: string } }) {
    try {
        const customers = await prisma.customer.findMany({
            where: { companyId: params.companyId },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
