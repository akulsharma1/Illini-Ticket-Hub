/*
  Warnings:

  - Added the required column `away_team` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "away_team" TEXT NOT NULL;
