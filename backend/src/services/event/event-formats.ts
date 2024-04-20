import { Event } from "@prisma/client";

export function isValidEventFormat(event: Event): boolean {
    if (!event) {
        return false;
    }

    if (!event.away_team || !event.event_start || !event.event_type || !event.stadium_location) {
        return false;
    }

    if (typeof event.away_team != "string" || typeof event.event_type != "string" || typeof event.stadium_location != "string") {
        return false;
    }

    if (event.event_start.getTime() < Date.now()) {
        return false;
    }

    return true;
}
