import { Ask } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export function isValidAskFormat(ask: Ask, price: number): boolean {
    if (!ask) {
        return false;
    }

    if (!price) {
        return false;
    }

    ask.price = new Decimal(price);

    if (!ask.price || !ask.event_id || !ask.owner_id) {
        return false;
    }

    if (isNaN(ask.price.toNumber()) || isNaN(ask.event_id) || isNaN(ask.owner_id)) {
        return false;
    }

    return true;
}
