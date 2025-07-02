import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const plans = await prisma.plan.findMany({ orderBy: { pricePerMonth: 'asc' } });
        return NextResponse.json(plans);
    } catch (error) {
        console.error('[GET_PLANS_ERROR]', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const plan = await prisma.plan.create({ data });
        return NextResponse.json(plan);
    } catch (error) {
        console.error('[CREATE_PLAN_ERROR]', error);
        return NextResponse.json({ message: 'Erreur lors de la création' }, { status: 500 });
    }
}