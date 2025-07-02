// app/api/companies/[companyId]/update/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CompanySchema } from '@/types/company';

export async function PUT(req: NextRequest, context: { params: { companyId: string } }) {
    const { companyId } = context.params;

    try {
        const body = await req.json();
        const parse = CompanySchema.safeParse(body);

        if (!parse.success) {
            return NextResponse.json({ message: 'Validation échouée', errors: parse.error.errors }, { status: 400 });
        }

        const data = parse.data;

        const updated = await prisma.company.update({
            where: { id: companyId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                invoicePrefix: data.invoicePrefix || 'FAC',
                signatureUrl: data.signatureUrl,
                stampUrl: data.stampUrl,
                planId: data.planId ?? null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('[UPDATE_COMPANY_ERROR]', error);
        return NextResponse.json({ message: 'Erreur serveur lors de la mise à jour.' }, { status: 500 });
    }
}
