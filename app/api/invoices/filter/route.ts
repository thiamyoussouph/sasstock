// /app/api/invoices/filter/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { companyId, fromDate, toDate, status } = await req.json();

        const invoices = await prisma.invoice.findMany({
            where: {
                companyId,
                status: status || undefined,
                createdAt: {
                    gte: fromDate ? new Date(fromDate) : undefined,
                    lte: toDate ? new Date(toDate) : undefined
                }
            },
            include: { customer: true, invoiceItems: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Erreur filtre factures:', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
