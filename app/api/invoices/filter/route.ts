import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { companyId, status, issueDateFrom, issueDateTo, dueDateFrom, dueDateTo } = await req.json();

        const invoices = await prisma.invoice.findMany({
            where: {
                companyId,
                status: status || undefined,
                issueDate: {
                    gte: issueDateFrom ? new Date(issueDateFrom) : undefined,
                    lte: issueDateTo ? new Date(issueDateTo) : undefined
                },
                dueDate: {
                    gte: dueDateFrom ? new Date(dueDateFrom) : undefined,
                    lte: dueDateTo ? new Date(dueDateTo) : undefined
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
