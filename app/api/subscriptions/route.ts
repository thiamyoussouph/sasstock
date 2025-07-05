import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const searchParams = url.searchParams;

        const rawFilters = {
            companyId: searchParams.get('companyId') || undefined,
            planId: searchParams.get('planId') || undefined,
            startDate: searchParams.get('startDate') || undefined,
            endDate: searchParams.get('endDate') || undefined,
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '10',
        };

        const querySchema = z.object({
            companyId: z.string().uuid().optional(),
            planId: z.string().uuid().optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            page: z.coerce.number().min(1).default(1),
            limit: z.coerce.number().min(1).max(100).default(10),
        });

        const parsed = querySchema.safeParse(rawFilters);
        if (!parsed.success) {
            console.error('[VALIDATION_ERROR]', parsed.error.format());
            return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
        }

        const { companyId, planId, startDate, endDate, page, limit } = parsed.data;
        const skip = (page - 1) * limit;

        const where: Prisma.SubscriptionWhereInput = {};
        if (companyId) where.companyId = companyId;
        if (planId) where.planId = planId;

        if (startDate || endDate) {
            where.startDate = {};
            if (startDate) where.startDate.gte = new Date(startDate);
            if (endDate) where.startDate.lte = new Date(endDate);
        }

        const [subscriptions, totalItems] = await Promise.all([
            prisma.subscription.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    company: true,
                    plan: true,
                    payments: true,
                },
            }),
            prisma.subscription.count({ where }),
        ]);

        return NextResponse.json(
            {
                data: subscriptions,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                page,
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            return NextResponse.json(
                { message: 'Erreur serveur', error: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json({ message: 'Erreur inconnue' }, { status: 500 });
    }
}
