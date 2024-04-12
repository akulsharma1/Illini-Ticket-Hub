import { Ask } from "@prisma/client";

export function isValidAskFormat(ask: Ask) {
    if (!ask) {
        return false;
    }
    if (!ask.price || !ask.event_id || !ask.owner_id) {
        return false;
    }

    if (isNaN(ask.price.toNumber()) || isNaN(ask.event_id) || isNaN(ask.owner_id)) {
        return false;
    }
}
