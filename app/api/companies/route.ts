// app/api/companies/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET all companies (optionally paginated)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                include: { plan: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip,
            }),
            prisma.company.count(),
        ]);

        return NextResponse.json({
            data: companies,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('[GET_COMPANIES_ERROR]', error);
        return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
    }
}
