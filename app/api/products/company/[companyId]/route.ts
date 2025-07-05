import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ companyId: string }> }
) {
    const params = await props.params;

    try {
        const { companyId } = params;
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '15', 10);
        const search = searchParams.get('search')?.toLowerCase() || '';
        const categoryId = searchParams.get('categoryId') || '';

        const skip = (page - 1) * limit;

        const whereClause: Prisma.ProductWhereInput = {
            companyId,
            ...(search && {
                name: {
                    contains: search,
                },
            }),
            ...(categoryId && { categoryId }),
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: whereClause,
                include: { category: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where: whereClause }),
        ]);

        return NextResponse.json({
            data: products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('[GET_PRODUCTS_ERROR]', error);
        return NextResponse.json(
            { message: 'Erreur serveur lors de la récupération des produits.' },
            { status: 500 }
        );
    }
}
