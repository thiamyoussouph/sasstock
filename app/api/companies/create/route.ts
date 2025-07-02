// app/api/companies/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            name,
            email,
            phone,
            address,
            planId,
            signatureUrl,
            stampUrl,
            invoicePrefix
        } = body;

        const newCompany = await prisma.company.create({
            data: {
                name,
                email,
                phone,
                address,
                planId,
                signatureUrl,
                stampUrl,
                invoicePrefix: invoicePrefix || 'FAC',
            },
        });

        return NextResponse.json(newCompany);
    } catch (error) {
        console.error('[CREATE_COMPANY_ERROR]', error);
        return NextResponse.json({ message: 'Erreur lors de la création de la société.' }, { status: 500 });
    }
}
