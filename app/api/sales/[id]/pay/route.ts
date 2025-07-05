import { prisma } from '@/lib/prisma';
import { PaymentType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const paymentSchema = z.object({
    amount: z.number().positive(),         // montant affecté à la vente
    montantRecu: z.number().positive(),    // ce que le client a donné
    monnaieRendue: z.number().min(0),      // ce qu’on rend
    method: z.enum(['CASH', 'MOBILE_MONEY', 'CARD']),
    note: z.string().optional(),
});

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const saleId = params.id;
        const body = await req.json();
        const data = paymentSchema.parse(body);

        // Vérifie si la vente existe
        const sale = await prisma.sale.findUnique({
            where: { id: saleId },
            include: { payments: true }
        });

        if (!sale) {
            return NextResponse.json({ message: 'Vente introuvable' }, { status: 404 });
        }

        // Somme des paiements déjà enregistrés
        const totalPayé = sale.payments.reduce((acc, p) => acc + p.amount, 0);

        if (totalPayé >= sale.total) {
            return NextResponse.json(
                { message: 'Vente déjà entièrement payée' },
                { status: 400 }
            );
        }

        // Enregistrement du paiement
        const payment = await prisma.payment.create({
            data: {
                saleId: sale.id,
                amount: data.amount,
                montantRecu: data.montantRecu,
                monnaieRendue: data.monnaieRendue,
                method: data.method as PaymentType,
                note: data.note,
            }
        });

        // Recalcul du total payé après ajout
        const nouveauTotalPayé = totalPayé + data.amount;

        // Déterminer le nouveau statut
        const nouveauStatut = nouveauTotalPayé >= sale.total ? 'PAID' : 'PARTIAL';

        // Mettre à jour le statut de la vente
        await prisma.sale.update({
            where: { id: sale.id },
            data: {
                status: nouveauStatut
            }
        });

        return NextResponse.json({
            message: 'Paiement enregistré',
            payment,
            status: nouveauStatut,
        });
    } catch (error: unknown) {
        console.error('Erreur paiement :', error);

        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Erreur serveur inconnue' }, { status: 500 });
    }
}
