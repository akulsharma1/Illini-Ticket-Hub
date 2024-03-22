import { Router, Request, Response } from "express";
import prisma from "../../lib/db";
import { NextFunction } from "express-serve-static-core";
import { RouterError } from "../../middleware/error-handler";
import StatusCode from "status-code-enum";

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

    // if lowestAskPrice doesnt exist, set lowestAsk to -1
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

    // if highestBidPrice doesnt exist, set highestBid to -1
    highestBid = highestBidPrice ? highestBidPrice.price.toNumber() : -1;

    return res.status(200).json({ success: true, event: event, lowest_ask: lowestAsk, highest_bid: highestBid });
});

export default eventRouter;
