// /app/api/invoices/update/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await req.json();
        const { title, total, dueDate, status, invoiceItems } = body;

        await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

        const updated = await prisma.invoice.update({
            where: { id },
            data: {
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

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Erreur modification facture:', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
