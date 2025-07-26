// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

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
    console.error('Erreur Dashboard API :', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
