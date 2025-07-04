import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const entities = [
    'CATEGORY', 'PRODUCT', 'INVOICE', 'SALE', 'CUSTOMER', 'SUPPLIER',
    'ORDER_SUPPLIER', 'PAYMENT', 'QUOTE', 'STOCK', 'USER', 'ROLE',
    'DISCOUNT', 'CASH_SESSION', 'SUBSCRIPTION', 'PLAN', 'DOCUMENT'
  ];

  const actions = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'];

  const permissions = entities.flatMap(entity =>
    actions.map(action => {
      const readable = entity.replace(/_/g, ' ').toLowerCase();
      return {
        code: `${action}:${entity}`,
        description: `PEUT ${action} ${readable.toUpperCase()}`
      };
    })
  );

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  const defaultPlan = await prisma.plan.upsert({
    where: { id: 'DEFAULT-SUPER-ADMIN' },
    update: {},
    create: {
      id: 'DEFAULT-SUPER-ADMIN',
      name: 'ADMIN FREEMIUM',
      pricePerMonth: 0,
      maxUsers: 999,
      maxProducts: 9999,
      maxSales: 99999,
      maxInvoices: 999,
    },
  });

  const company = await prisma.company.upsert({
    where: { email: 'admin@ladygest.com' },
    update: {},
    create: {
      name: 'CARLOS CENTER',
      email: 'admin@ladygest.com',
      address: 'DAKAR, SÉNÉGAL',
      phone: '+221778889999',
      planId: defaultPlan.id,
      invoicePrefix: 'FAC',
      lastInvoiceNumber: 0,
      lastInvoiceYear: new Date().getFullYear(),
    },
  });

  const roles = ['ADMIN', 'MANAGER', 'CAISSIER', 'VENDEUR'];
  const createdRoles: Record<string, any> = {};

  for (const roleName of roles) {
    let role = await prisma.role.findFirst({
      where: { name: roleName, companyId: company.id },
    });
    if (!role) {
      role = await prisma.role.create({
        data: { name: roleName, companyId: company.id },
      });
    }
    createdRoles[roleName] = role;
  }

  const allPermissions = await prisma.permission.findMany();

  for (const perm of allPermissions) {
    const exists = await prisma.rolePermission.findFirst({
      where: {
        roleId: createdRoles['ADMIN'].id,
        permissionId: perm.id,
      },
    });
    if (!exists) {
      await prisma.rolePermission.create({
        data: {
          roleId: createdRoles['ADMIN'].id,
          permissionId: perm.id,
        },
      });
    }
  }

  const hashedPassword = await bcryptjs.hash('adminkaba@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@ladygest.com' },
    update: {},
    create: {
      name: 'SUPER ADMIN',
      email: 'admin@ladygest.com',
      password: hashedPassword,
      companyId: company.id,
      roleId: createdRoles['ADMIN'].id,
    },
  });

  const roleDefaults = [
    { name: 'MANAGER', email: 'manager@ladygest.com' },
    { name: 'CAISSIER', email: 'caissier@ladygest.com' },
    { name: 'VENDEUR', email: 'vendeur@ladygest.com' }
  ];

  for (const user of roleDefaults) {
    const hash = await bcryptjs.hash('password123', 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hash,
        companyId: company.id,
        roleId: createdRoles[user.name].id,
      },
    });
  }

  console.log('✅ BASE DE DONNÉES INITIALISÉE AVEC SUCCÈS !');
}

main()
  .catch((e) => {
    console.error('❌ ERREUR LORS DU SEED :', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
