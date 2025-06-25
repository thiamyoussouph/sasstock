// /app/api/invoices/create/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { companyId, customerId, title, total, dueDate, status, invoiceItems } = body;

        const invoice = await prisma.invoice.create({
            data: {
                companyId,
                customerId,
                title,
                total,
                dueDate: dueDate ? new Date(dueDate) : null,
                status,
                invoiceItems: {
                    create: invoiceItems.map((item: any) => ({
                        name: item.name,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total
                    }))
                }
            },
            include: { invoiceItems: true }
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Erreur création facture:', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}