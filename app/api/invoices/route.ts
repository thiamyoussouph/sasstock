// app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/invoices?companyId=xxx&status=paid&startDate=...&endDate=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!companyId) return NextResponse.json({ message: 'companyId requis' }, { status: 400 });

    const where: any = { companyId };
    if (status) where.status = status;
    if (startDate && endDate) {
        where.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

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
