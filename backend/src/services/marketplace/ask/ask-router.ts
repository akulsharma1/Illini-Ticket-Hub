import { Router, Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import prisma from "../../../lib/db";
import { RouterError } from "../../../middleware/error-handler";
import StatusCode from "status-code-enum";
import { Ask } from "@prisma/client";
import { checkIfNewOwnerAlreadyOwnsTicket, matchBidAndAsk } from "../transfer/transfer-helpers";
import { findHighestBid } from "../bid/bid-helpers";
import { checkIfAskExists } from "./ask-helpers";

const askRouter: Router = Router();

askRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.query.event_id;

    if (!eventId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "event_id query parameter required"));
    }

    const asks = await prisma.ask.findMany({
        where: {
            event_id: Number(eventId),
        },
        select: {
            price: true,
        },
        orderBy: {
            price: "asc",
        },
    });

    return res.status(200).json({ success: true, asks: asks });
});

askRouter.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    const ask: Ask = req.body as Ask;

    if (!ask.price || !ask.event_id || !ask.owner_id) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid body parameters"));
    }

    const askExists = await checkIfAskExists(ask);
    if (askExists) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "cannot place multiple asks"));
    }

    const ownsTicket = await checkIfNewOwnerAlreadyOwnsTicket(ask.owner_id, ask.event_id);
    if (!ownsTicket) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "must own ticket to place ask"));
    }

    const resp = await prisma.ask
        .create({
            data: {
                owner_id: ask.owner_id,
                event_id: ask.event_id,
                price: ask.price,
            },
        })
        .catch((error) => {
            return next(new RouterError(StatusCode.ClientErrorPreconditionFailed, "error adding ask", undefined, error.message));
        });

    if (!resp) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error adding ask"));
    }
    // TODO: handle bid/ask matching
    const highestBid = await findHighestBid(resp);

    if (!highestBid || highestBid.price < resp.price) {
        // is fine, just don't do a transfer
        return res.status(StatusCode.SuccessOK).json({ success: true, message: "placed ask" });
    }

    await matchBidAndAsk(highestBid, ask)
        .then(() => {
            return res
                .status(StatusCode.SuccessCreated)
                .json({ success: true, message: "transferred ticket to new owner. new ownerid: " + highestBid.owner_id });
        })
        .catch((reason: any) => {
            return next(new RouterError(StatusCode.ClientErrorBadRequest, "error executing sale, ask placed", undefined, reason));
        });

    /**
     * NOTE: there is a limitation with the current system. if someone deletes their bid/ask in the middle of the transfer process, it will cause issues
     * Even if there are multiple asks/bids with the same price it still won't execute the transaction
     * Potential fix: Asynchronous thread running every x seconds to match bids/asks.
     */
});

export default askRouter;
