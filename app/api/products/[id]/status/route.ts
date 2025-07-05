import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const { isActive } = await req.json();

        if (typeof isActive !== 'boolean') {
            return NextResponse.json({ message: 'isActive doit être un booléen.' }, { status: 400 });
        }

        const updated = await prisma.product.update({
            where: { id: params.id },
            data: { isActive },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de isActive :', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
