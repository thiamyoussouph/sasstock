// app/api/auth/me/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_ladygest';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    try {
        const payload = jwt.verify(token, SECRET_KEY);

        return NextResponse.json({ user: payload });
    } catch (error) {
        console.log('Erreur de vérification du token:', error);

        return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }
}
