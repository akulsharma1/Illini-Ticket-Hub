/*
  Warnings:

  - Added the required column `stadium_location` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "stadium_location" TEXT NOT NULL;
