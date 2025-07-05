import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ton client Prisma
import { createSubscriptionSchema } from '@/validations/subscription.schema';
import { addMonths } from 'date-fns';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const input = createSubscriptionSchema.parse(body);

        const { companyId, planId, durationInMonths } = input;

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) {
            return NextResponse.json({ message: 'Plan introuvable' }, { status: 404 });
        }

        const amount = plan.pricePerMonth * durationInMonths;

        // simulate paiement (remplace plus tard)
        const paymentSuccess = true;

        if (!paymentSuccess) {
            return NextResponse.json({ message: 'Paiement échoué' }, { status: 402 });
        }

        const now = new Date();
        const endDate = addMonths(now, durationInMonths);

        const subscription = await prisma.subscription.create({
            data: {
                companyId,
                planId,
                startDate: now,
                endDate,
                status: 'ACTIVE',
                paymentStatus: 'PAID',
            },
        });

        await prisma.subscriptionPayment.create({
            data: {
                subscriptionId: subscription.id,
                amount,
                paymentMethod: 'MANUAL',
                status: 'PAID',
                paidAt: new Date(),
            },
        });

        return NextResponse.json({ subscription }, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            return NextResponse.json(
                { message: 'Erreur serveur', error: error.message },
                { status: 500 }
            );
        }
    }

}
