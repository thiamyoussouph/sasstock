import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const data = await req.json();
        const product = await prisma.product.update({
            where: { id: params.id },
            data,
        });
        return NextResponse.json(product);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erreur mise à jour produit' }, { status: 500 });
    }
}