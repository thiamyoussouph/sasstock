/*
  Warnings:

  - You are about to drop the column `enableExport` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `enableMultiPOS` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `enableReports` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `enableSync` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `maxSalesPerDay` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `paymentProvider` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paymentRef` on the `Subscription` table. All the data in the column will be lost.
  - Made the column `pricePerMonth` on table `Plan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePerMonth" REAL NOT NULL,
    "features" JSONB,
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "maxProducts" INTEGER NOT NULL DEFAULT 100,
    "maxSales" INTEGER NOT NULL DEFAULT 500,
    "maxInvoices" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Plan" ("description", "id", "maxProducts", "maxUsers", "name", "pricePerMonth") SELECT "description", "id", coalesce("maxProducts", 100) AS "maxProducts", coalesce("maxUsers", 1) AS "maxUsers", "name", "pricePerMonth" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "planId" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PAID',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("companyId", "createdAt", "endDate", "id", "startDate", "status") SELECT "companyId", "createdAt", "endDate", "id", "startDate", "status" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
