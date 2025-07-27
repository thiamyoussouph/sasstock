// app/api/dashboard/route.ts
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
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const companyId = decoded.companyId;

    // Récupère les statistiques liées à l’entreprise de l’utilisateur connecté
    const productsCount = await prisma.product.count({ where: { companyId } });
    const customersCount = await prisma.customer.count({ where: { companyId } });
    const salesCount = await prisma.sale.count({ where: { companyId } });

    const salesTotalData = await prisma.sale.aggregate({
      where: { companyId },
      _sum: { total: true },
    });

    return NextResponse.json({
      productsCount,
      customersCount,
      salesCount,
      salesTotal: salesTotalData._sum.total || 0,
    });
  } catch (error) {
    console.error('Erreur stats dashboard :', error);
    return NextResponse.json({ message: 'Token invalide ou erreur serveur' }, { status: 500 });
  }
}
