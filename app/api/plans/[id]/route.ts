import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const data = await req.json();
        const plan = await prisma.plan.update({ where: { id: params.id }, data });
        return NextResponse.json(plan);
    } catch (error) {
        console.error('[UPDATE_PLAN_ERROR]', error);
        return NextResponse.json({ message: 'Erreur mise à jour' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.plan.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE_PLAN_ERROR]', error);
        return NextResponse.json({ message: 'Erreur suppression' }, { status: 500 });
    }
}