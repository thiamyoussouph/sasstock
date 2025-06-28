// app/api/customers/[id]/delete/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.customer.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Client supprimé' });
    } catch (error) {
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
