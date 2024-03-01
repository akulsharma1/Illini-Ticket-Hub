/*
  Warnings:

  - You are about to drop the column `access_token` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `google_user_id` on the `Account` table. All the data in the column will be lost.
  - Added the required column `password` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Account_google_user_id_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "access_token",
DROP COLUMN "google_user_id",
ADD COLUMN     "password" TEXT NOT NULL;
