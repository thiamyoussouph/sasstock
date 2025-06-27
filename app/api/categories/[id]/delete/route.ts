// --- app/api/categories/[id]/delete/route.ts ---
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        await prisma.category.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Supprimée' });
    } catch (error) {
        return NextResponse.json({ message: 'Erreur' }, { status: 500 });
    }
}