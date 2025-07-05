// app/api/invoices/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_ladygest';

interface DecodedToken {
    companyId: string;
    permissions?: string[];
    [key: string]: unknown;
}

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return NextResponse.json({ message: 'Token manquant' }, { status: 401 });
    }

    let decoded: DecodedToken;
    try {
        decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;
    } catch {
        return NextResponse.json({ message: 'Token invalide' }, { status: 403 });
    }

    const userCompanyId = decoded.companyId;

    const { id } = params;
    const { status }: { status: 'paid' | 'unpaid' } = await req.json();

    if (!['paid', 'unpaid'].includes(status)) {
        return NextResponse.json({ message: 'Statut invalide' }, { status: 400 });
    }

    try {
        const invoice = await prisma.invoice.findUnique({ where: { id } });

        if (!invoice || invoice.companyId !== userCompanyId) {
            return NextResponse.json({ message: 'Facture introuvable ou non autorisée' }, { status: 404 });
        }

        const updated = await prisma.invoice.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error('Erreur changement de statut :', err);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
