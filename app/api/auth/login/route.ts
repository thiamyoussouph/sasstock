import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_ladygest';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email et mot de passe requis.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                company: true,
                role: {
                    include: {
                        permissions: { include: { permission: true } }
                    }
                },
                permissions: { include: { permission: true } }
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'Utilisateur introuvable.' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ message: 'Mot de passe incorrect.' }, { status: 401 });
        }

        const rolePermissions = user.role?.permissions.map(rp => rp.permission.code) ?? [];
        const userPermissions = user.permissions.map(up => up.permission.code);
        const allPermissions = Array.from(new Set([...rolePermissions, ...userPermissions]));

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                companyId: user.companyId,
                role: user.role?.name ?? null,
                permissions: allPermissions
            },
            SECRET_KEY,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                company: {
                    id: user.company.id,
                    name: user.company.name
                },
                role: user.role?.name ?? null,
                permissions: allPermissions
            }
        });
    } catch (error) {
        console.error('Erreur login :', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
