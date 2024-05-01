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

bidRouter.post("/edit", async (req: Request, res: Response, next: NextFunction) => {
    const bid: Bid = req.body as Bid; // not actually a new bid, just contains all the info we need to update an existing bid

    if (!bid.price || !bid.event_id || !bid.owner_id) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid body parameters"));
    }

    const bidExists = await checkIfBidExists(bid);

    if (!bidExists) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "must have an active bid before editing it"));
    }

    // don't need to check if the user owns a ticket b/c to place a bid, they must own a ticket and
    // we already checked if they have a bid or not

    const updatedBid = await prisma.bid
        .update({
            where: {
                // the primary key of a bid is a composite key made from owner_id and event_id
                owner_id_event_id: {
                    owner_id: bid.owner_id,
                    event_id: bid.event_id,
                },
            },
            data: {
                price: bid.price,
            },
        })
        .catch((error) => {
            return next(new RouterError(StatusCode.ClientErrorPreconditionFailed, "error adding bid", undefined, error.message));
        });

    if (!updatedBid) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error editing bid"));
    }

    const lowestAsk = await findLowestAsk(updatedBid);

    if (!lowestAsk || Number(lowestAsk.price) > Number(updatedBid.price)) {
        // is fine, just don't do a transfer
        return res.status(StatusCode.SuccessOK).json({ success: true, message: "edited bid" });
    }

    await matchBidAndAsk(updatedBid, lowestAsk)
        .then(() => {
            return res
                .status(StatusCode.SuccessCreated)
                .json({ success: true, message: "transferred ticket to new owner. new ownerid: " + updatedBid.owner_id });
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((reason: any) => {
            return next(new RouterError(StatusCode.ServerErrorInternal, "error executing sale, bid placed", undefined, reason));
        });
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

    if (!lowestAsk || Number(lowestAsk.price) > Number(resp.price)) {
        // is fine, just don't do a transfer
        return res.status(StatusCode.SuccessOK).json({
            success: true,
            message: "placed bid",
            lowestAskPrice: lowestAsk ? lowestAsk.price : "No asks available",
            respPrice: resp.price,
        });
    }

    await matchBidAndAsk(resp, lowestAsk)
        .then(() => {
            return res
                .status(StatusCode.SuccessCreated)
                .json({ success: true, message: "transferred ticket to new owner. new ownerid: " + resp.owner_id });
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((reason: any) => {
            return next(new RouterError(StatusCode.ServerErrorInternal, "error executing sale, bid placed", undefined, reason));
        });

    /**
     * NOTE: there is a limitation with the current system. if someone deletes their bid/ask in the middle of the transfer process, it will cause issues
     * Even if there are multiple asks/bids with the same price it still won't execute the transaction
     * Potential fix: Asynchronous thread running every x seconds to match bids/asks.
     */
});

bidRouter.post("/delete", async (req: Request, res: Response, next: NextFunction) => {
    const bid: Bid = req.body as Bid; // not actually a new bid, just contains all the info we need to update an existing bid

    if (!bid.price || !bid.event_id || !bid.owner_id) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid body parameters"));
    }

    const bidExists = await checkIfBidExists(bid);

    if (!bidExists) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "delete bid failed - user doesn't own bid"));
    }

    // don't need to check if the user owns a ticket b/c to place a bid, they must own a ticket and
    // we already checked if they have a bid or not

    const updatedBid = await prisma.bid
        .delete({
            where: {
                // the primary key of a bid is a composite key made from owner_id and event_id
                owner_id_event_id: {
                    owner_id: bid.owner_id,
                    event_id: bid.event_id,
                },
            },
        })
        .catch((error) => {
            return next(
                new RouterError(StatusCode.ClientErrorPreconditionFailed, "error deleting bid", undefined, error.message),
            );
        });

    if (!updatedBid) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error deleting bid"));
    }

    // Send a success message
    return res.status(StatusCode.SuccessOK).json({
        success: true,
        message: "Bid successfully deleted",
    });
});

export default bidRouter;
