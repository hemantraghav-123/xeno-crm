/*
  Warnings:

  - Added the required column `channel` to the `Communication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `Communication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Communication" ADD COLUMN     "channel" TEXT NOT NULL,
ADD COLUMN     "clickedAt" TIMESTAMP(3),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "openedAt" TIMESTAMP(3);
