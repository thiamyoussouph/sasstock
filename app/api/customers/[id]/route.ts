// app/api/customers/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: params.id },
        });
        return customer
            ? NextResponse.json(customer)
            : NextResponse.json({ message: 'Client introuvable' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
