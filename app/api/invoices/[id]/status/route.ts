// app/api/invoices/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_ladygest';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return NextResponse.json({ message: 'Token manquant' }, { status: 401 });
    }

    let decoded: any;
    try {
        decoded = jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return NextResponse.json({ message: 'Token invalide' }, { status: 403 });
    }

    const userCompanyId = decoded.companyId;
    const userPermissions: string[] = decoded.permissions || [];

    // Vérifier si l'utilisateur a la permission de modifier une facture
    // if (!userPermissions.includes('invoice:update')) {
    //     return NextResponse.json({ message: 'Permission refusée' }, { status: 403 });
    // }

    const { id } = params;
    const { status } = await req.json();

    if (!['paid', 'unpaid'].includes(status)) {
        return NextResponse.json({ message: 'Statut invalide' }, { status: 400 });
    }

    try {
        // Vérifier si la facture appartient bien à l'entreprise de l'utilisateur
        const invoice = await prisma.invoice.findUnique({ where: { id } });

        if (!invoice || invoice.companyId !== userCompanyId) {
            return NextResponse.json({ message: 'Facture introuvable ou non autorisée' }, { status: 404 });
        }

        const updated = await prisma.invoice.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Erreur changement de statut :', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
