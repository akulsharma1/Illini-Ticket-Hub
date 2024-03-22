import { Router, Request, Response } from "express";
import prisma from "../../lib/db";
import { NextFunction } from "express-serve-static-core";
import { RouterError } from "../../middleware/error-handler";
import StatusCode from "status-code-enum";

const eventRouter: Router = Router();

eventRouter.get("/test", async (_: Request, res: Response) => {
    return res.status(200).json({ success: true });
});

eventRouter.get("/", async (_: Request, res: Response, next: NextFunction) => {
    const events = await prisma.event.findMany({
        where: {
            event_start: {
                gt: new Date(),
            },
            sales_enabled: true,
        },
    });

    if (!events) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error getting events"));
    }
    return res.status(200).json({ success: true, events: events });
});

eventRouter.get("/prices/:event_id", async (req: Request, res: Response, next: NextFunction) => {
    const eventIdStr: string = req.params.event_id;

    if (!eventIdStr) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "event_id URL parameter required"));
    }

    let lowestAsk: number;
    let highestBid: number;

    const eventId = Number(eventIdStr); // eventid: 2, 3, etc.

    const event = await prisma.event.findUnique({
        where: {
            event_id: eventId,
        },
        select: {
            event_id: true,
            event_type: true,
            away_team: true,
            event_start: true,
            stadium_location: true,
        },
    });

    if (!event) {
        return next(new RouterError(StatusCode.ClientErrorNotFound, "event not found"));
    }

    const lowestAskPrice = await prisma.ask.findFirst({
        where: {
            event_id: eventId,
        },
        select: {
            price: true,
        },
        orderBy: {
            price: "asc",
        },
    });

    lowestAsk = lowestAskPrice ? lowestAskPrice.price.toNumber() : -1;

    const highestBidPrice = await prisma.bid.findFirst({
        where: {
            event_id: eventId,
        },
        select: {
            price: true,
        },
        orderBy: {
            price: "desc",
        },
    });

    highestBid = highestBidPrice ? highestBidPrice.price.toNumber() : -1;

    return res.status(200).json({ success: true, event: event, lowest_ask: lowestAsk, highest_bid: highestBid });
});

export default eventRouter;
