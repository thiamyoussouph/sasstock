// /app/api/invoices/details/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: params.id },
            include: { customer: true, invoiceItems: true, company: true },
        });

        if (!invoice) {
            return NextResponse.json({ message: 'Facture non trouvée' }, { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Erreur détails facture:', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}