// API Route - POST /api/users/permissions
// File: app/api/users/permissions/route.ts
import { assignPermissionsSchema } from '@/types/permission';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = assignPermissionsSchema.parse(body);

    // Supprimer les anciennes permissions
    await prisma.userPermission.deleteMany({ where: { userId: parsed.userId } });

    // Ajouter les nouvelles
    await prisma.userPermission.createMany({
      data: parsed.permissionIds.map((permissionId) => ({
        userId: parsed.userId,
        permissionId,
      })),
    });

    return NextResponse.json({ message: 'Permissions mises à jour avec succès' });
  } catch (err: any) {
    console.error('Permission update error:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
