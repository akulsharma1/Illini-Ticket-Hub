/*
  Warnings:

  - A unique constraint covering the columns `[email_address]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Account_email_address_key" ON "Account"("email_address");
