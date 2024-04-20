import { Router, Request, Response } from "express";
import prisma from "../../lib/db";
import { NextFunction } from "express-serve-static-core";
import { RouterError } from "../../middleware/error-handler";
import StatusCode from "status-code-enum";
import { Event } from "@prisma/client";
import { isValidEventFormat } from "./event-formats";

const eventRouter: Router = Router();

eventRouter.get("/test", async (_: Request, res: Response) => {
    return res.status(200).json({ success: true });
});

/**
 * @api {get} /events GET /events
 * @apiGroup event
 * @apiDescription Gets details for all events after the current time
 *
 *
 * @apiSuccess (200: Success) {Json} events
 * @apiSuccessExample Example Success Response:
 * HTTP/1.1 200 OK
 * {
    "success": true,
    "events": [
        {
            "event_id": 3,
            "event_type": "basketball",
            "away_team": "Maryland",
            "event_start": "2025-03-22T14:39:03.773Z",
            "sales_enabled": true,
            "stadium_location": "State Farm Center",
            "created_at": "2024-03-22T19:39:03.773Z"
        },
        {
            "event_id": 4,
            "event_type": "soccer",
            "away_team": "Northwestern",
            "event_start": "2025-03-22T14:39:03.807Z",
            "sales_enabled": true,
            "stadium_location": "Soccer Stadium",
            "created_at": "2024-03-22T19:39:03.806Z"
        }
    ]
}

 * @apiError (500: Internal Server Error) {String} "error getting events" Error serverside getting events.
 * @apiErrorExample Example Error Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {"success": false, "error": "error getting events"}
 */

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

/**
 * @api {get} /events/prices/:event_id GET /events/prices/:event_id
 * @apiGroup event
 * @apiDescription Gets highest bid, lowest ask, and event details for a given event_id.
 *
 * @apiParam {int} event_id Event ID. Returns status code 400 if not specified.
 *
 * @apiSuccess (200: Success) {Json} n/a highest bid, lowest ask, event details
 * @apiSuccessExample Example Success Response:
 * HTTP/1.1 200 OK
 * {
    "success": true,
    "event": {
        "event_id": 4,
        "event_type": "soccer",
        "away_team": "Northwestern",
        "event_start": "2025-03-22T14:39:03.807Z",
        "stadium_location": "Soccer Stadium"
    },
    "lowest_ask": -1,
    "highest_bid": -1
}

 * @apiError (400: Bad Request) {String} "event_id URL parameter required" Event ID URL param is required (e.g. /events/prices/12) 
 * @apiError (404: Not Found) {String} "event not found" Event with a given Event ID was not found.
 * @apiErrorExample Example Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {"success": false, "error": "event_id URL parameter required"}
 */

eventRouter.get("/prices/:event_id", async (req: Request, res: Response, next: NextFunction) => {
    const eventIdStr: string = req.params.event_id;

    if (!eventIdStr) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "event_id URL parameter required"));
    }

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

    // if lowestAskPrice doesnt exist, set lowestAsk to -1
    const lowestAsk = lowestAskPrice ? lowestAskPrice.price.toNumber() : -1;

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

    // if highestBidPrice doesnt exist, set highestBid to -1
    const highestBid = highestBidPrice ? highestBidPrice.price.toNumber() : -1;

    return res.status(200).json({ success: true, event: event, lowest_ask: lowestAsk, highest_bid: highestBid });
});

eventRouter.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    let event: Event = req.body as Event;

    if (!isValidEventFormat(event)) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid body parameters"));
    }

    event.sales_enabled = true;

    const createdEvent = await prisma.event.create({
        data: {
            event_type: event.event_type,
            away_team: event.away_team,
            event_start: event.event_start,
            sales_enabled: event.sales_enabled,
            stadium_location: event.stadium_location,
        },
    });

    if (!createdEvent) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "error creating event"));
    }

    return res.status(200).json({ success: true, message: "created event", event: createdEvent });
});

/**
 * @api {get} /events/prices/top/:event_id GET /events/prices/top/:event_id
 * @apiGroup event
 * @apiDescription Retrieves the top 5 lowest ask prices and top 5 highest bid prices for a given event_id.
 *
 * @apiParam {int} event_id Event ID. Returns status code 400 if not specified.
 *
 * @apiSuccess (200: Success) {Boolean} success Indicates if the request was successful.
 * @apiSuccess (200: Success) {int} event_id The ID of the event.
 * @apiSuccess (200: Success) {Number[]} top_5_lowest_asks Array of the top 5 lowest ask prices.
 * @apiSuccess (200: Success) {Number[]} top_5_highest_bids Array of the top 5 highest bid prices.
 *
 * @apiSuccessExample Example Success Response:
 * HTTP/1.1 200 OK
 * {
 *     "success": true,
 *     "event_id": 123,
 *     "top_5_lowest_asks": [100, 110, 120, 130, 140],
 *     "top_5_highest_bids": [300, 290, 280, 270, 260]
 * }
 *
 * @apiError (400: Bad Request) {String} "event_id URL parameter required" Event ID URL parameter is required (e.g. /events/prices/top/123).
 * @apiError (404: Not Found) {String} "event not found" Event with the specified Event ID was not found.
 * @apiErrorExample Example Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "success": false,
 *         "error": "event_id URL parameter required"
 *     }
 */

eventRouter.get("/prices/top/:event_id", async (req: Request, res: Response, next: NextFunction) => {
    const eventIdStr: string = req.params.event_id;

    if (!eventIdStr) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "event_id URL parameter required"));
    }

    const eventId = Number(eventIdStr);

    try {
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
            return next(new RouterError(StatusCode.ClientErrorNotFound, "Event not found"));
        }

        const lowestAskPrices = await prisma.ask.findMany({
            where: {
                event_id: eventId,
            },
            select: {
                price: true,
            },
            orderBy: {
                price: "asc",
            },
            take: 5,
        });

        const highestBidPrices = await prisma.bid.findMany({
            where: {
                event_id: eventId,
            },
            select: {
                price: true,
            },
            orderBy: {
                price: "desc",
            },
            take: 5,
        });

        const top5LowestAsks = lowestAskPrices.map((ask) => ask.price.toNumber());
        const top5HighestBids = highestBidPrices.map((bid) => bid.price.toNumber());

        return res.status(200).json({
            success: true,
            event_id: eventId,
            event_type: event.event_type,
            away_team: event.away_team,
            event_start: event.event_start,
            stadium_location: event.stadium_location,
            top_5_lowest_asks: top5LowestAsks,
            top_5_highest_bids: top5HighestBids,
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return next(new RouterError(StatusCode.ServerErrorInternal, "Internal Server Error"));
    }
});

eventRouter.get("/transactions/:event_id", async (req: Request, res: Response, next: NextFunction) => {
    const eventIdStr = req.params.event_id;

    if (!eventIdStr || Number.isNaN(eventIdStr)) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid event_id url parameter"));
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            event_id: Number(eventIdStr),
        },
        select: {
            created_at: true,
            price: true,
        },
    });

    return res.status(200).json({success: true, message: "found transactions", transactions: transactions});
});

export default eventRouter;
