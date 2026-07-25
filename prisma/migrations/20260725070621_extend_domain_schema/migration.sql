/*
  Warnings:

  - You are about to drop the column `description` on the `batches` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `batches` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `examDate` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `totalMarks` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `paid` on the `fees` table. All the data in the column will be lost.
  - You are about to drop the column `paidDate` on the `fees` table. All the data in the column will be lost.
  - You are about to drop the column `marks` on the `marks` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `teachers` table. All the data in the column will be lost.
  - Added the required column `teacherId` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Made the column `subject` on table `batches` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `maxMarks` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testDate` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `fees` table without a default value. This is not possible if the table is not empty.
  - Made the column `month` on table `fees` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `marksObtained` to the `marks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `marks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "MarkStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttendanceStatus" ADD VALUE 'LATE';
ALTER TYPE "AttendanceStatus" ADD VALUE 'EXCUSED';

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "teacherId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "batches" DROP COLUMN "description",
DROP COLUMN "isArchived",
ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyFee" DECIMAL(10,2),
ADD COLUMN     "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "subject" SET NOT NULL;

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "description",
DROP COLUMN "examDate",
DROP COLUMN "totalMarks",
ADD COLUMN     "maxMarks" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "teacherId" TEXT NOT NULL,
ADD COLUMN     "testDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "fees" DROP COLUMN "paid",
DROP COLUMN "paidDate",
ADD COLUMN     "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "teacherId" TEXT NOT NULL,
ALTER COLUMN "month" SET NOT NULL;

-- AlterTable
ALTER TABLE "marks" DROP COLUMN "marks",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "marksObtained" DECIMAL(6,2) NOT NULL,
ADD COLUMN     "status" "MarkStatus" NOT NULL DEFAULT 'PRESENT',
ADD COLUMN     "teacherId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "name",
ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "guardianName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "guardianPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "teacherId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "name",
ADD COLUMN     "autoReports" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "designation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "teachesUnderInstitute" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "institutes" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "pincode" TEXT NOT NULL DEFAULT '',
    "contactNumber" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_schedule_entries" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "day" "WeekDay" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "batch_schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "feeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutes_teacherId_key" ON "institutes"("teacherId");

-- CreateIndex
CREATE INDEX "batch_schedule_entries_batchId_idx" ON "batch_schedule_entries"("batchId");

-- CreateIndex
CREATE INDEX "payments_feeId_idx" ON "payments"("feeId");

-- CreateIndex
CREATE INDEX "payments_studentId_idx" ON "payments"("studentId");

-- CreateIndex
CREATE INDEX "payments_teacherId_idx" ON "payments"("teacherId");

-- CreateIndex
CREATE INDEX "attendances_teacherId_idx" ON "attendances"("teacherId");

-- CreateIndex
CREATE INDEX "exams_teacherId_idx" ON "exams"("teacherId");

-- CreateIndex
CREATE INDEX "fees_teacherId_idx" ON "fees"("teacherId");

-- CreateIndex
CREATE INDEX "marks_teacherId_idx" ON "marks"("teacherId");

-- CreateIndex
CREATE INDEX "students_teacherId_idx" ON "students"("teacherId");

-- AddForeignKey
ALTER TABLE "institutes" ADD CONSTRAINT "institutes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_schedule_entries" ADD CONSTRAINT "batch_schedule_entries_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
