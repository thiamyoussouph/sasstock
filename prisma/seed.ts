import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // ➤ Créer des permissions de base
    const permissions = [
        { code: 'STOCK_VIEW', description: 'Voir les stocks' },
        { code: 'SALES_CREATE', description: 'Créer des ventes' },
        { code: 'USERS_MANAGE', description: 'Gérer les utilisateurs' },
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { code: perm.code },
            update: {},
            create: perm,
        });
    }

    // ➤ Créer un plan Freemium
    const defaultPlan = await prisma.plan.upsert({
        where: { id: 'default-super-admin' },
        update: {},
        create: {
            id: 'default-super-admin',
            name: 'Admin Freemium',
            pricePerMonth: 0,
        },
    });

    // ➤ Créer une entreprise de test avec les nouveaux champs
    const company = await prisma.company.upsert({
        where: { email: 'admin@ladygest.com' },
        update: {},
        create: {
            name: 'Carlos Center',
            email: 'admin@ladygest.com',
            address: 'Dakar, Sénégal',
            phone: '+221778889999',
            planId: defaultPlan.id,
            invoicePrefix: 'FAC',         // ➕ Préfixe par défaut
            lastInvoiceNumber: 0,         // ➕ Dernier numéro (sera incrémenté à chaque facture)
            lastInvoiceYear: new Date().getFullYear(), // ➕ Année en cours
        },
    });

    // ➤ Vérifier si le rôle ADMIN existe déjà
    let adminRole = await prisma.role.findFirst({
        where: {
            name: 'ADMIN',
            companyId: company.id,
        },
    });

    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                name: 'ADMIN',
                companyId: company.id,
            },
        });
    }

    // ➤ Associer toutes les permissions à ce rôle
    const allPermissions = await prisma.permission.findMany();
    for (const perm of allPermissions) {
        const exists = await prisma.rolePermission.findFirst({
            where: {
                roleId: adminRole.id,
                permissionId: perm.id,
            },
        });

        if (!exists) {
            await prisma.rolePermission.create({
                data: {
                    roleId: adminRole.id,
                    permissionId: perm.id,
                },
            });
        }
    }

    // ➤ Créer l'utilisateur admin par défaut
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('adminkaba@123', 10);

    await prisma.user.upsert({
        where: { email: 'adminkaba@ladygest.com' },
        update: {},
        create: {
            name: 'Super Admin',
            email: 'adminkaba@ladygest.com',
            password: hashedPassword,
            companyId: company.id,
            roleId: adminRole.id,
        },
    });

    console.log('✅ Données initiales insérées avec succès.');
}

main()
    .catch((e) => {
        console.error('Erreur dans le seed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
