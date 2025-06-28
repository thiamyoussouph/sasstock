import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.supplier.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ message: 'Fournisseur supprimé' });
    } catch (error) {
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
