import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            companyId,
            customerId,
            quoteId,
            title,
            dueDate,
            issueDate,
            status,
            tva,
            note,
            comment,
            invoiceItems
        } = body;

        // Validation des données obligatoires
        if (!companyId) {
            return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
        }

        if (!invoiceItems || invoiceItems.length === 0) {
            return NextResponse.json({ message: 'Invoice items are required' }, { status: 400 });
        }

        // Charger la compagnie
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return NextResponse.json({ message: 'Company not found' }, { status: 404 });
        }

        const currentYear = new Date().getFullYear();
        // ✅ Gérer le cas où lastInvoiceNumber peut être null
        let newInvoiceNumber = (company.lastInvoiceNumber || 0) + 1;
        let invoiceYear = company.lastInvoiceYear || currentYear;

        // Si nouvelle année, on remet le compteur à 1
        if (currentYear !== invoiceYear) {
            newInvoiceNumber = 1;
            invoiceYear = currentYear;
        }

        // ✅ Corriger le padStart - utiliser '0' au lieu de '3'
        const invoiceNumber = `${company.invoicePrefix}-${invoiceYear}-${String(newInvoiceNumber).padStart(3, '0')}`;

        // ✅ Calculer le total avec validation
        const calculatedTotal = invoiceItems.reduce(
            (acc: number, item: { quantity: number; unitPrice: number; total?: number }) => {
                const itemTotal = item.total ?? (item.quantity * item.unitPrice);
                return acc + itemTotal;
            },
            0
        );

        // ✅ Vérifier que le total n'est pas NaN
        if (isNaN(calculatedTotal)) {
            return NextResponse.json({ message: 'Invalid total calculation' }, { status: 400 });
        }

        const totalWithTVA = tva ? calculatedTotal + (calculatedTotal * tva / 100) : calculatedTotal;

        // ✅ Créer la facture avec gestion des valeurs null
        const invoice = await prisma.invoice.create({
            data: {
                companyId,
                customerId: customerId || null,  // ✅ Convertir string vide en null
                quoteId: quoteId || null,        // ✅ Convertir string vide en null
                title,
                invoiceNumber,
                total: totalWithTVA,
                dueDate: dueDate ? new Date(dueDate) : null,  // ✅ null au lieu de undefined
                issueDate: issueDate ? new Date(issueDate) : new Date(),
                status: status || 'unpaid',
                tva: tva || null,                // ✅ null au lieu de undefined
                note: note || null,              // ✅ null au lieu de undefined
                comment: comment || null,        // ✅ null au lieu de undefined
                invoiceItems: {
                    create: invoiceItems.map((item: { name: string; quantity: number; unitPrice: number; total?: number }) => ({
                        name: item.name,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total ?? (item.quantity * item.unitPrice),
                    }))
                },
            },
            include: {
                invoiceItems: true,
                company: true,  // ✅ Inclure company pour éviter l'erreur
            },
        });

        // Mettre à jour la compagnie
        await prisma.company.update({
            where: { id: companyId },
            data: {
                lastInvoiceNumber: newInvoiceNumber,
                lastInvoiceYear: invoiceYear,
            },
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Erreur création facture:', error);

        // ✅ Afficher plus de détails sur l'erreur en développement
        if (process.env.NODE_ENV === 'development') {
            return NextResponse.json({
                message: 'Erreur serveur',
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }, { status: 500 });
        }

        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}