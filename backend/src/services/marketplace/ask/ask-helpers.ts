import { Ask, Bid } from "@prisma/client";
import prisma from "../../../lib/db";

export async function findLowestAsk(bid: Bid): Promise<Ask> {
    const lowestAskArr: Ask[] = await prisma.ask.findMany({
        where: {
            event_id: bid.event_id,
        },
        orderBy: [{ price: "asc" }, { created_at: "asc" }],
        take: 1,
    });

    if (lowestAskArr.length <= 0) {
        return null;
    }

    const lowestAsk: Ask = lowestAskArr[0];

    return lowestAsk;
}

export async function checkIfAskExists(ask: Ask): Promise<boolean> {
    const foundAsk = await prisma.ask.findUnique({
        where: {
            owner_id_event_id: {
                owner_id: ask.owner_id,
                event_id: ask.event_id,
            },
        },
    });

    if (!foundAsk) {
        return false;
    }
    return true;
}
