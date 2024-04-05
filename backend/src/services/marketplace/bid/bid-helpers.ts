import { Ask, Bid } from "@prisma/client";
import prisma from "../../../lib/db";

export async function findHighestBid(ask: Ask): Promise<Bid> {
    const highestBidArr: Bid[] = await prisma.bid.findMany({
        where: {
            event_id: ask.event_id,
        },
        orderBy: [{ price: "desc" }, { created_at: "asc" }],
        take: 1,
    });

    if (highestBidArr.length <= 0) {
        return null;
    }

    const highestBid: Bid = highestBidArr[0];

    return highestBid;
}

export async function checkIfBidExists(bid: Bid): Promise<boolean> {
    const foundBid = await prisma.bid.findUnique({
        where: {
            owner_id_event_id: {
                owner_id: bid.owner_id,
                event_id: bid.event_id,
            },
        },
    });

    if (!foundBid) {
        return false;
    }
    return true;
}
