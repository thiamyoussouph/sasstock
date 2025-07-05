// --- app/api/categories/company/[companyId]/route.ts ---
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_: NextRequest, props: { params: Promise<{ companyId: string }> }) {
    const params = await props.params;
    try {
        const categories = await prisma.category.findMany({
            where: { companyId: params.companyId },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ message: 'Erreur serveur', error }, { status: 500 });
    }
}