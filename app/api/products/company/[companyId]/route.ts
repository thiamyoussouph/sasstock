import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_: NextRequest, { params }: { params: { companyId: string } }) {
    try {
        const products = await prisma.product.findMany({ where: { companyId: params.companyId }, include: { category: true } });
        return NextResponse.json(products);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erreur chargement produits' }, { status: 500 });
    }
}