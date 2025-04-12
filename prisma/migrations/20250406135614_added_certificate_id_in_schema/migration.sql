/*
  Warnings:

  - A unique constraint covering the columns `[certificateId]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `certificateId` to the `certificates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "certificateId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateId_key" ON "certificates"("certificateId");
