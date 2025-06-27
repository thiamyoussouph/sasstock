import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const product = await prisma.product.create({ data });
        return NextResponse.json(product);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erreur création produit' }, { status: 500 });
    }
}