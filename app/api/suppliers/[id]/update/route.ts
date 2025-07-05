import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateSchema = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
});

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await req.json();
        const data = updateSchema.parse(body);

        const updated = await prisma.supplier.update({
            where: { id: params.id },
            data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Erreur update fournisseur:', error);
        return NextResponse.json(
            { message: error instanceof z.ZodError ? error.errors : 'Erreur serveur' },
            { status: 500 }
        );
    }
}
