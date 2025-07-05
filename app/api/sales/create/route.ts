import { prisma } from '@/lib/prisma';
import { PaymentType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

type SaleItemInput = {
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
};

type PaymentInput = {
    amount: number;
    montantRecu: number;
    monnaieRendue: number;
    method: string;
    note?: string;
};

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Génération de numberSale ici (ex: COM-2025-00001)
        const count = await prisma.sale.count({ where: { companyId: data.companyId } });
        const numberSale = `COM-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

        const sale = await prisma.sale.create({
            data: {
                companyId: data.companyId,
                userId: data.userId,
                customerId: data.customerId,
                tvaId: data.tvaId,
                total: data.total,
                saleMode: data.saleMode,
                paymentType: data.paymentType as PaymentType,
                status: data.status,
                numberSale,
                saleItems: {
                    create: (data.saleItems as SaleItemInput[]).map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total,
                    })),
                },
                payments: {
                    create: (data.payments as PaymentInput[]).map((p) => ({
                        amount: p.amount,
                        montantRecu: p.montantRecu,
                        monnaieRendue: p.monnaieRendue,
                        method: p.method as PaymentType,
                        note: p.note,
                    })),
                },
            },
        });

        // Mettre à jour le stock des produits vendus
        for (const item of data.saleItems as SaleItemInput[]) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { quantity: { decrement: item.quantity } },
            });
        }

        return NextResponse.json(sale);
    } catch (error) {
        console.error('Erreur création vente:', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
