import { Ticket } from "@prisma/client";
import prisma from "../../../lib/db";

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

    return event.sales_enabled && event.event_start.getTime() < Date.now();
}

export async function checkIfNewOwnerAlreadyOwnsTicket(newOwnerId: number, eventId: number): Promise<boolean | undefined> {
    const resp = await prisma.ticket.findUnique({
        where: {
            owner_id_event_id: {
                owner_id: newOwnerId,
                event_id: eventId
            }
        }
    })

    if (!resp) return false;

    return true;
}
