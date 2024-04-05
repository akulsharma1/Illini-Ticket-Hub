import { Ask, Bid, Transaction } from "@prisma/client";
import prisma from "../../../lib/db";

export async function addTransaction(ask: Ask, bid: Bid): Promise<Transaction> {
    const resp = await prisma.transaction.create({
        data: {
            buyer_id: bid.owner_id,
            seller_id: ask.owner_id,
            event_id: ask.event_id,
            price: bid.price,
        },
    });
    return resp;
}
