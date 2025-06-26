/*
  Warnings:

  - You are about to drop the column `number` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `invoiceNumber` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "quoteId" TEXT,
    "title" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "Invoice_companyId_invoiceNumber_key" ON "Invoice"("companyId", "invoiceNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
