import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_ladygest';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Vérification du token
    const decoded = jwt.verify(token, SECRET_KEY) as { companyId: string };

    if (!decoded || !decoded.companyId) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }

    const companyId = decoded.companyId;

    // Récupérer les statistiques
    const [productsCount, customersCount, salesCount, salesTotal] = await Promise.all([
      prisma.product.count({ where: { companyId } }),
      prisma.customer.count({ where: { companyId } }),
      prisma.sale.count({ where: { companyId } }),
      prisma.sale.aggregate({
        where: { companyId },
        _sum: { total: true },
      }),
    ]);

    return NextResponse.json({
      productsCount,
      customersCount,
      salesCount,
      salesTotal: salesTotal._sum.total ?? 0,
    });
  } catch (error) {
    console.error('Erreur dans /api/dashboard :', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
