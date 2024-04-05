import { Ask, Bid, Ticket } from "@prisma/client";
import prisma from "../../../lib/db";
import { addTransaction } from "../transactions/transactions-helper";

/**
 * Transfers ownership to a new owner id. Assumes the ticket is transferrable.
 * @param ticket
 * @param newOwnerId
 */
export async function transferOwnership(ticket: Ticket, newOwnerId: number): Promise<boolean | undefined> {
    const resp = await prisma.ticket.update({
        where: {
            owner_id_event_id: {
                owner_id: ticket.owner_id,
                event_id: ticket.event_id,
            },
        },
        data: {
            owner_id: newOwnerId,
            listed: false,
        },
    });

    return resp.owner_id == newOwnerId;
}

export async function checkIfTransferrableTicket(ticket: Ticket): Promise<boolean | undefined> {
    if (ticket.listed || ticket.used) {
        return false;
    }

    const event = await prisma.event.findUnique({
        where: { event_id: ticket.event_id },
    });

    return event.sales_enabled && event.event_start.getTime() > Date.now();
}

export async function checkIfNewOwnerAlreadyOwnsTicket(newOwnerId: number, eventId: number): Promise<boolean | undefined> {
    const resp = await prisma.ticket.findUnique({
        where: {
            owner_id_event_id: {
                owner_id: newOwnerId,
                event_id: eventId,
            },
        },
    });

    if (!resp) return false;

    return true;
}

export async function matchBidAndAsk(bid: Bid, ask: Ask): Promise<void> {
    const ticket: Ticket = await prisma.ticket.findUnique({
        where: {
            owner_id_event_id: {
                owner_id: ask.owner_id,
                event_id: ask.event_id,
            },
        },
    });

    if (!ticket) {
        return Promise.reject("ticket does not exist");
    }

    const transferrable = await checkIfTransferrableTicket(ticket);

    if (!transferrable) {
        return Promise.reject("ticket is not transferrable");
    }

    const newOwnerOwnsTicket = await checkIfNewOwnerAlreadyOwnsTicket(bid.owner_id, bid.event_id);
    if (newOwnerOwnsTicket) {
        return Promise.reject("new owner already owns ticket");
    }

    const transfer = await transferOwnership(ticket, bid.owner_id);

    if (!transfer) {
        return Promise.reject("error transferring ticket");
    }

    const addToTransactionTable = await addTransaction(ask, bid);

    if (!addToTransactionTable) {
        return Promise.reject("error adding to transaction table");
    }

    const deletedBid = await deleteBid(bid);

    if (!deletedBid) {
        return Promise.reject("transferred ticket, error deleting bid");
    }
    const deletedAsk = await deleteAsk(ask);

    if (!deletedAsk) {
        return Promise.reject("transferred ticket, error deleting ask");
    }
    return Promise.resolve();
}

export async function deleteBid(bid: Bid): Promise<boolean | undefined> {
    const result = await prisma.bid.delete({
        where: {
            owner_id_event_id: {
                owner_id: bid.owner_id,
                event_id: bid.event_id,
            },
        },
    });

    if (!result) {
        return false;
    }

    return true;
}

export async function deleteAsk(ask: Ask): Promise<boolean | undefined> {
    const result = await prisma.ask.delete({
        where: {
            owner_id_event_id: {
                owner_id: ask.owner_id,
                event_id: ask.event_id,
            },
        },
    });

    if (!result) {
        return false;
    }

    return true;
}
