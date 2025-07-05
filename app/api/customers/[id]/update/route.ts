// app/api/customers/[id]/update/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateSchema = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    creditLimit: z.number().optional(),
});

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const data = updateSchema.parse(body);

        const updated = await prisma.customer.update({
            where: { id: (await context.params).id }, // ✅ correction ici
            data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Erreur MAJ client:', error);
        return NextResponse.json(
            { message: error instanceof z.ZodError ? error.errors : 'Erreur serveur' },
            { status: 500 }
        );
    }
}
