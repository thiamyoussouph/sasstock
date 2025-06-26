/*
  Warnings:

  - Added the required column `number` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "planId" TEXT,
    "signatureUrl" TEXT,
    "stampUrl" TEXT,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'FAC',
    "lastInvoiceNumber" INTEGER NOT NULL DEFAULT 0,
    "lastInvoiceYear" INTEGER NOT NULL DEFAULT 2025,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Company_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Company" ("address", "createdAt", "email", "id", "name", "phone", "planId", "signatureUrl", "stampUrl", "updatedAt") SELECT "address", "createdAt", "email", "id", "name", "phone", "planId", "signatureUrl", "stampUrl", "updatedAt" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "quoteId" TEXT,
    "title" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "tva" REAL,
    "issueDate" DATETIME,
    "note" TEXT,
    "comment" TEXT,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("comment", "companyId", "createdAt", "customerId", "dueDate", "id", "issueDate", "note", "quoteId", "status", "title", "total", "tva") SELECT "comment", "companyId", "createdAt", "customerId", "dueDate", "id", "issueDate", "note", "quoteId", "status", "title", "total", "tva" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_companyId_number_key" ON "Invoice"("companyId", "number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
