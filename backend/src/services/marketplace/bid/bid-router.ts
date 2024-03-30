import { Router, Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import prisma from "../../../lib/db";
import { RouterError } from "../../../middleware/error-handler";
import StatusCode from "status-code-enum";
import { Bid } from "@prisma/client";
import { checkIfNewOwnerAlreadyOwnsTicket, matchBidAndAsk } from "../transfer/transfer-helpers";
import { findLowestAsk } from "../ask/ask-helpers";
import { checkIfBidExists } from "./bid-helpers";

const bidRouter: Router = Router();

bidRouter.get("/test", async (_: Request, res: Response) => {
    return res.status(200).json({ success: true });
});

bidRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.query.event_id;

    if (!eventId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "event_id query parameter required"));
    }

    const bids = await prisma.bid.findMany({
        where: {
            event_id: Number(eventId),
        },
        select: {
            price: true,
        },
        orderBy: {
            price: "desc",
        },
    });

    return res.status(200).json({ success: true, bids: bids });
});

bidRouter.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    const bid: Bid = req.body as Bid;

    if (!bid.price || !bid.event_id || !bid.owner_id) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid body parameters"));
    }

    const bidExists = await checkIfBidExists(bid);

    if (bidExists) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "cannot place multiple bids"));
    }

    const alreadyOwnsTicket = await checkIfNewOwnerAlreadyOwnsTicket(bid.owner_id, bid.event_id);
    if (alreadyOwnsTicket) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "cannot place bid for ticket when one is already owned"));
    }

    const resp = await prisma.bid
        .create({
            data: {
                price: bid.price,
                event_id: bid.event_id,
                owner_id: bid.owner_id,
            },
        })
        .catch((error) => {
            return next(new RouterError(StatusCode.ClientErrorPreconditionFailed, "error adding bid", undefined, error.message));
        });

    if (!resp) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error adding bid"));
    }

    const lowestAsk = await findLowestAsk(resp);

    if (!lowestAsk) {
        // is fine, just don't do a transfer
        return res.status(StatusCode.SuccessOK).json({ success: true, message: "placed bid" });
    }

    await matchBidAndAsk(resp, lowestAsk)
        .then(() => {
            return res
                .status(StatusCode.SuccessCreated)
                .json({ success: true, message: "transferred ticket to new owner. new ownerid: " + resp.owner_id });
        })
        .catch((reason: any) => {
            return next(new RouterError(StatusCode.ServerErrorInternal, "error executing sale, bid placed", undefined, reason));
        });

    /**
     * NOTE: there is a limitation with the current system. if someone deletes their bid/ask in the middle of the transfer process, it will cause issues
     * Even if there are multiple asks/bids with the same price it still won't execute the transaction
     * Potential fix: Asynchronous thread running every x seconds to match bids/asks.
     */
});

export default bidRouter;
