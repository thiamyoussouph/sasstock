/*
  Warnings:

  - You are about to drop the column `quantity` on the `StockMovement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN "dateExpiration" DATETIME;
ALTER TABLE "Product" ADD COLUMN "purchasePrice" REAL;

-- CreateTable
CREATE TABLE "StockMovementItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stockMovementId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchasePrice" REAL,
    CONSTRAINT "StockMovementItem_stockMovementId_fkey" FOREIGN KEY ("stockMovementId") REFERENCES "StockMovement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StockMovementItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT,
    CONSTRAINT "StockMovement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StockMovement" ("companyId", "createdAt", "createdBy", "description", "id", "productId", "type") SELECT "companyId", "createdAt", "createdBy", "description", "id", "productId", "type" FROM "StockMovement";
DROP TABLE "StockMovement";
ALTER TABLE "new_StockMovement" RENAME TO "StockMovement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
