// --- app/api/categories/[id]/update/route.ts ---
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const { name } = await req.json();

        const existing = await prisma.category.findFirst({
            where: {
                name,
                companyId: (await prisma.category.findUnique({ where: { id: params.id } }))?.companyId,
                NOT: { id: params.id },
            },
        });

        if (existing) {
            return NextResponse.json({ message: 'Ce nom est déjà pris.' }, { status: 409 });
        }

        const updated = await prisma.category.update({
            where: { id: params.id },
            data: { name },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ message: 'Erreur serveur',error }, { status: 500 });
    }
}