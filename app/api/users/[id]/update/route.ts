import { prisma } from '@/lib/prisma';
import { updateUserSchema } from '@/validations/user';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    const body = await req.json();

    const parsed = updateUserSchema.parse(body);

    const { id, password, ...rest } = parsed;

    const data: any = { ...rest };
    if (password) {
        data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
        where: { id },
        data,
    });

    return NextResponse.json(updated);
}
