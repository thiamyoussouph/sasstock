import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { name, companyId } = await req.json();

        if (!name || !companyId) {
            return NextResponse.json({ message: 'Nom et entreprise requis.' }, { status: 400 });
        }

        const existing = await prisma.category.findFirst({
            where: { name, companyId },
        });

        if (existing) {
            return NextResponse.json({ message: 'Cette catégorie existe déjà.' }, { status: 409 });
        }

        const category = await prisma.category.create({
            data: { name, companyId },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Erreur création catégorie', error);
        return NextResponse.json({ message: 'Erreur interne' }, { status: 500 });
    }
}