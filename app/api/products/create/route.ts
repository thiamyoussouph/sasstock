import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const name = formData.get('name') as string;
        const companyId = formData.get('companyId') as string;
        const categoryId = formData.get('categoryId') as string | null;
        const tvaId = formData.get('tvaId') as string | null;
        const codeBar = formData.get('codeBar') as string | null;
        const description = formData.get('description') as string | null;
        const unit = formData.get('unit') as string;
        const price = parseFloat(formData.get('price') as string);
        const priceHalf = parseFloat(formData.get('priceHalf') as string) || null;
        const priceWholesale = parseFloat(formData.get('priceWholesale') as string) || null;
        const stockMin = parseInt(formData.get('stockMin') as string) || 0;
        const quantity = parseInt(formData.get('quantity') as string) || 0;
        const isActive = formData.get('isActive') === 'true';
        const image = formData.get('mainImage') as File | null;

        let imageUrl = '';

        // 💾 Upload local dans /public/uploads
        if (image && image.size > 0) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = image.name.split('.').pop();
            const filename = `product-${uuid()}.${ext}`;
            const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
            await writeFile(uploadPath, buffer);
            imageUrl = `/uploads/${filename}`;
        }

        const product = await prisma.product.create({
            data: {
                name,
                companyId,
                categoryId: categoryId || null,
                tvaId: tvaId || null,
                codeBar,
                description,
                unit,
                price,
                priceHalf,
                priceWholesale,
                stockMin,
                quantity,
                isActive,
                mainImage: imageUrl,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Erreur création produit:', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}
