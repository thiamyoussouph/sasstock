import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // ✅ Ajouter Prisma types

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!companyId) return NextResponse.json({ message: 'companyId requis' }, { status: 400 });

    const where: Prisma.InvoiceWhereInput = {
        companyId,
        ...(status && { status }),
        ...(startDate && endDate && {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        }),
    };

    const invoices = await prisma.invoice.findMany({
        where,
        include: {
            customer: true,
            invoiceItems: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
}
