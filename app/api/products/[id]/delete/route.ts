import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.product.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Produit supprimé' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erreur suppression produit' }, { status: 500 });
    }
}