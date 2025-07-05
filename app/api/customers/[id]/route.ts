// app/api/customers/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: params.id },
        });
        return customer
            ? NextResponse.json(customer)
            : NextResponse.json({ message: 'Client introuvable' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ message: 'Erreur serveur',error }, { status: 500 });
    }
}
