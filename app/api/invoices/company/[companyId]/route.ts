// /app/api/invoices/company/[companyId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, props: { params: Promise<{ companyId: string }> }) {
    const params = await props.params;
    try {
        const invoices = await prisma.invoice.findMany({
            where: { companyId: params.companyId },
            include: { customer: true, invoiceItems: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Erreur récupération factures entreprise:', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
