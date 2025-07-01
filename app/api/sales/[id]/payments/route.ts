import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const saleId = params.id;

        const sale = await prisma.sale.findUnique({
            where: { id: saleId },
            include: {
                payments: true,
            },
        });

        if (!sale) {
            return NextResponse.json({ message: 'Vente introuvable' }, { status: 404 });
        }

        const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
        const amountRemaining = Math.max(0, sale.total - totalPaid);
        const status = amountRemaining === 0 ? 'PAYED' : totalPaid > 0 ? 'PARTIAL' : 'UNPAID';

        return NextResponse.json({
            saleId: sale.id,
            total: sale.total,
            totalPaid,
            amountRemaining,
            status,
            payments: sale.payments,
        });
    } catch (error) {
        console.error('Erreur récupération paiements :', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
