import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.supplier.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ message: 'Fournisseur supprimé' });
    } catch (error) {
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
