import { prisma } from '@/lib/prisma';
import { createUserSchema } from '@/validations/user';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();

    const parsed = createUserSchema.parse(body);

    const hashed = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.user.create({
        data: {
            ...parsed,
            password: hashed,
        },
    });

    return NextResponse.json(user, { status: 201 });
}
