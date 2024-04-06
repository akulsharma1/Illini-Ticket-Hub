-- CreateTable
CREATE TABLE "Transaction" (
    "buyer_id" INTEGER NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("buyer_id","seller_id","created_at")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;
