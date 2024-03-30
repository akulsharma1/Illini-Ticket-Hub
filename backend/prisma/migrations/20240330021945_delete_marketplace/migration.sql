/*
  Warnings:

  - You are about to drop the `Marketplace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ask" DROP CONSTRAINT "Ask_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Marketplace" DROP CONSTRAINT "Marketplace_event_id_fkey";

-- DropTable
DROP TABLE "Marketplace";

-- AddForeignKey
ALTER TABLE "Ask" ADD CONSTRAINT "Ask_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;
