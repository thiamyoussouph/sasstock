// app/api/suppliers/create/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const supplierSchema = z.object({
    companyId: z.string(),
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = supplierSchema.parse(body);
        const supplier = await prisma.supplier.create({ data });
        return NextResponse.json(supplier);
    } catch (error) {
        console.error('Erreur creation fournisseur:', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
