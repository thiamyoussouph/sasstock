import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ companyId: string }> }
) {
    const companyId = (await context.params)?.companyId;

    if (!companyId) {
        return NextResponse.json({ message: 'companyId requis' }, { status: 400 });
    }

    try {
        const users = await prisma.user.findMany({
            where: { companyId },
            include: { role: true },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('[GET_USERS_BY_COMPANY_ERROR]', error);
        return NextResponse.json(
            { message: 'Erreur lors de la récupération des utilisateurs' },
            { status: 500 }
        );
    }
}
