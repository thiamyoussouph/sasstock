/*
  Warnings:

  - Added the required column `monnaieRendue` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montantRecu` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberSale` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "montantRecu" REAL NOT NULL,
    "monnaieRendue" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "id", "method", "note", "paidAt", "saleId") SELECT "amount", "id", "method", "note", "paidAt", "saleId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "numberSale" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" TEXT,
    "tvaId" TEXT,
    "total" REAL NOT NULL,
    "saleMode" TEXT NOT NULL DEFAULT 'DETAIL',
    "paymentType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_tvaId_fkey" FOREIGN KEY ("tvaId") REFERENCES "TVA" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("companyId", "createdAt", "customerId", "id", "paymentType", "status", "total", "tvaId", "userId") SELECT "companyId", "createdAt", "customerId", "id", "paymentType", "status", "total", "tvaId", "userId" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE UNIQUE INDEX "Sale_companyId_numberSale_key" ON "Sale"("companyId", "numberSale");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
