// app/api/categories/[id]/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Typage correct pour les handlers App Router
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 ce type doit être exactement celui-ci
) {
  const { id } = (await context.params);

  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: 'Supprimée' });
  } catch (error) {
    console.error(error); // 👈 utile pour debug
    return NextResponse.json({ message: 'Erreur' }, { status: 500 });
  }
}
