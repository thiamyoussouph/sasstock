import { prisma } from '@/lib/prisma';
import { updateUserSchema } from '@/validations/user';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function PUT(req: NextRequest) {
    const body = await req.json();

    const parsed = updateUserSchema.parse(body);
    const { id, password, roleId, ...rest } = parsed;

    // Construction de l'objet de mise à jour
    const data: Prisma.UserUpdateInput = {
        ...rest,
        ...(password && { password: await bcrypt.hash(password, 10) }),
        ...(roleId && {
            role: {
                connect: {
                    id: roleId,
                },
            },
        }),
    };

    const updated = await prisma.user.update({
        where: { id },
        data,
    });

    return NextResponse.json(updated);
}
