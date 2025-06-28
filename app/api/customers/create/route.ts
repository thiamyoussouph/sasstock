// app/api/customers/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const customerSchema = z.object({
    companyId: z.string(),
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    creditLimit: z.number().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = customerSchema.parse(body);

        const customer = await prisma.customer.create({ data });
        return NextResponse.json(customer);
    } catch (error) {
        console.error('Erreur création client:', error);
        return NextResponse.json(
            { message: error instanceof z.ZodError ? error.errors : 'Erreur serveur' },
            { status: 500 }
        );
    }
}
