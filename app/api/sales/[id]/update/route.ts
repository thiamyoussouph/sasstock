import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id; // ✅ Accès correct au paramètre dynamique
    const body = await req.json();

    console.log('BODY PAYLOAD FOR UPDATE:', body);

    const {
      customerId,
      paymentType,
      saleMode,
      status,
      tvaId,
      total,
      saleItems,
      payments,
    } = body;

    if (!Array.isArray(saleItems) || saleItems.length === 0) {
      return NextResponse.json(
        { message: 'Liste des produits vide.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(payments)) {
      return NextResponse.json(
        { message: 'Paiements invalides.' },
        { status: 400 }
      );
    }

    // Restaurer les anciens stocks
    const previousItems = await prisma.saleItem.findMany({ where: { saleId: id } });
    for (const item of previousItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    // Supprimer anciens items et paiements
    await prisma.saleItem.deleteMany({ where: { saleId: id } });
    await prisma.payment.deleteMany({ where: { saleId: id } });

    // Mettre à jour la vente
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        customerId,
        paymentType,
        saleMode,
        status,
        tvaId,
        total,
        saleItems: {
          create: saleItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
        payments: {
          create: payments.map((p: any) => ({
            amount: p.amount,
            montantRecu: p.montantRecu,
            monnaieRendue: p.monnaieRendue,
            method: p.method,
            note: p.note ?? null,
          })),
        },
      },
      include: {
        saleItems: true,
        payments: true,
      },
    });

    // Mettre à jour le stock avec les nouvelles quantités
    for (const item of saleItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error('[UPDATE SALE ERROR]', error);
    return NextResponse.json(
      { message: 'Erreur serveur lors de la mise à jour de la vente' },
      { status: 500 }
    );
  }
}
