// app/api/products/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const companyId = formData.get('companyId')?.toString();

        if (!file || !companyId) {
            console.error('❌ Fichier ou companyId manquant');
            return NextResponse.json({ message: 'Fichier ou ID de l’entreprise manquant.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

        console.log(`✅ ${rows.length} lignes lues dans le fichier Excel.`);

        if (rows.length === 0) {
            console.warn('⚠️ Le fichier est vide.');
            return NextResponse.json({ message: 'Le fichier est vide.' }, { status: 400 });
        }

        const createdProducts: any[] = [];
        const duplicates: any[] = [];
        const newCategories: Set<string> = new Set();

        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            console.log(`🔍 Traitement ligne ${index + 1}:`, row);

            const name = row['Nom'];
            const category = row['Catégorie'];
            const price = row['Prix détail'];
            const unit = row['Unité'];

            const codeBar = row['Code barre'];
            const description = row['Description'];
            const purchasePrice = row['Prix achat'];
            const priceHalf = row['Prix demi-gros'];
            const priceWholesale = row['Prix gros'];
            const stockMin = row['Stock min'];
            const quantity = row['Quantité'];
            const isActive = row['Actif'];
            const dateExpiration = row['Date expiration'];

            if (!name || !category || !price || !unit) {
                console.warn(`⛔ Ligne ignorée (champs obligatoires manquants):`, row);
                continue;
            }

            const exists = await prisma.product.findFirst({
                where: {
                    companyId,
                    name,
                    ...(codeBar ? { codeBar: codeBar.toString() } : {})
                }
            });

            if (exists) {
                console.warn(`⚠️ Produit déjà existant : ${name}`);
                duplicates.push(row);
                continue;
            }

            let cat = await prisma.category.findFirst({
                where: { name: category, companyId }
            });

            if (!cat) {
                cat = await prisma.category.create({
                    data: { name: category, companyId }
                });
                newCategories.add(category);
                console.log(`📁 Catégorie créée : ${category}`);
            }

            const productData = {
                name,
                companyId,
                categoryId: cat.id,
                codeBar: codeBar?.toString() || undefined,
                description: description || '',
                purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
                price: parseFloat(price),
                priceHalf: priceHalf ? parseFloat(priceHalf) : undefined,
                priceWholesale: priceWholesale ? parseFloat(priceWholesale) : undefined,
                unit,
                stockMin: stockMin ? parseInt(stockMin) : 0,
                quantity: quantity ? parseInt(quantity) : 0,
                isActive: isActive === false || isActive === 'false' ? false : true,
                dateExpiration: dateExpiration ? new Date(dateExpiration) : undefined
            };

            createdProducts.push(productData);
            console.log(`✅ Produit préparé pour création: ${name}`);
        }

        if (createdProducts.length > 0) {
            await prisma.product.createMany({ data: createdProducts });
            console.log(`✅ ${createdProducts.length} produits insérés dans la base.`);
        } else {
            console.log('ℹ️ Aucun produit à insérer.');
        }

        return NextResponse.json({
            message: `✅ ${createdProducts.length} produits créés avec succès.`,
            created: createdProducts.length,
            duplicates,
            newCategories: Array.from(newCategories)
        });
    } catch (error) {
        console.error('[UPLOAD_PRODUCTS_ERROR]', error);
        return NextResponse.json(
            { message: 'Erreur lors du traitement du fichier.' },
            { status: 500 }
        );
    }
}
