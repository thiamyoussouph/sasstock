/*
  Warnings:

  - A unique constraint covering the columns `[companyId,name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT,
    "tvaId" TEXT,
    "name" TEXT NOT NULL,
    "codeBar" TEXT,
    "description" TEXT,
    "price" REAL NOT NULL,
    "priceHalf" REAL,
    "priceWholesale" REAL,
    "unit" TEXT NOT NULL,
    "stockMin" INTEGER NOT NULL DEFAULT 0,
    "mainImage" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_tvaId_fkey" FOREIGN KEY ("tvaId") REFERENCES "TVA" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "codeBar", "companyId", "createdAt", "description", "id", "mainImage", "name", "price", "priceHalf", "priceWholesale", "stockMin", "tvaId", "unit", "updatedAt") SELECT "categoryId", "codeBar", "companyId", "createdAt", "description", "id", "mainImage", "name", "price", "priceHalf", "priceWholesale", "stockMin", "tvaId", "unit", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_codeBar_key" ON "Product"("codeBar");
CREATE UNIQUE INDEX "Product_companyId_name_codeBar_key" ON "Product"("companyId", "name", "codeBar");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_companyId_name_key" ON "Category"("companyId", "name");
