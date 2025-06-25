-- AlterTable
ALTER TABLE "Company" ADD COLUMN "signatureUrl" TEXT;
ALTER TABLE "Company" ADD COLUMN "stampUrl" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "comment" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "issueDate" DATETIME;
ALTER TABLE "Invoice" ADD COLUMN "note" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "tva" REAL;
