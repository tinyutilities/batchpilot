-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_batchId_fkey";

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "batchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
