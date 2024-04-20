import { Router, Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import prisma from "../../../lib/db";
import { RouterError } from "../../../middleware/error-handler";
import StatusCode from "status-code-enum";
import { Ask } from "@prisma/client";
import { checkIfNewOwnerAlreadyOwnsTicket, matchBidAndAsk } from "../transfer/transfer-helpers";
import { findHighestBid } from "../bid/bid-helpers";
import { checkIfAskExists } from "./ask-helpers";
import { isValidAskFormat } from "./ask-formats";

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

askRouter.post("/edit", async (req: Request, res: Response, next: NextFunction) => {
    const ask: Ask = req.body as Ask; // not actually a new bid, just contains all the info we need to update an existing bid

    if (!ask.price || !ask.event_id || !ask.owner_id) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid body parameters"));
    }

    const askExists = await checkIfAskExists(ask);

    if (!askExists) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "must have an active bid before editing it"));
    }

    // don't need to check if the user owns a ticket b/c to place a bid, they must own a ticket and
    // we already checked if they have a ask or not

    const updatedAsk = await prisma.ask
        .update({
            where: {
                // the primary key of a ask is a composite key made from owner_id and event_id
                owner_id_event_id: {
                    owner_id: ask.owner_id,
                    event_id: ask.event_id,
                },
            },
            data: {
                price: ask.price,
            },
        })
        .catch((error) => {
            return next(new RouterError(StatusCode.ClientErrorPreconditionFailed, "error adding bid", undefined, error.message));
        });

    if (!updatedAsk) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error editing bid"));
    }

    const highestBid = await findHighestBid(updatedAsk);

    if (!highestBid || Number(highestBid.price) < Number(updatedAsk.price)) {
        // is fine, just don't do a transfer
        return res.status(StatusCode.SuccessOK).json({ success: true, message: "placed ask" });
    }

    await matchBidAndAsk(highestBid, updatedAsk)
        .then(() => {
            return res
                .status(StatusCode.SuccessCreated)
                .json({ success: true, message: "transferred ticket to new owner. new ownerid: " + highestBid.owner_id });
        })
        .catch((reason: any) => {
            return next(new RouterError(StatusCode.ClientErrorBadRequest, "error executing sale, ask placed", undefined, reason));
        });
});

askRouter.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    const ask: Ask = req.body as Ask;

    // TODO: change to new ask format checker
    if (!isValidAskFormat(ask)) {
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

    // change the ticket to be listed
    const setListed = await prisma.ticket
        .update({
            where: {
                // the primary key of a bid is a composite key made from owner_id and event_id
                owner_id_event_id: {
                    owner_id: ask.owner_id,
                    event_id: ask.event_id,
                },
            },
            data: {
                listed: true,
            },
        })
        .catch((error) => {
            return next(
                new RouterError(StatusCode.ClientErrorPreconditionFailed, "failed to list ticket", undefined, error.message),
            );
        });

    if (!setListed) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "failed to list ticket"));
    }

    // TODO: handle bid/ask matching
    const highestBid = await findHighestBid(resp);

    if (!highestBid || Number(highestBid.price) < Number(resp.price)) {
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

askRouter.post("/delete", async (req: Request, res: Response, next: NextFunction) => {
    const ask: Ask = req.body as Ask; // not actually a new ask, just contains all the info we need to update an existing bid

    if (!ask.price || !ask.event_id || !ask.owner_id) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid body parameters"));
    }

    const askExists = await checkIfAskExists(ask);

    if (!askExists) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "delete ask failed - user doesn't own ask"));
    }

    // don't need to check if the user owns a ticket b/c to place a ask, they must own a ticket and
    // we already checked if they have a ask or not

    const updatedAsk = await prisma.ask
        .delete({
            where: {
                // the primary key of a ask is a composite key made from owner_id and event_id
                owner_id_event_id: {
                    owner_id: ask.owner_id,
                    event_id: ask.event_id,
                },
            },
        })
        .catch((error) => {
            return next(new RouterError(StatusCode.ClientErrorPreconditionFailed, "error deleting ask", undefined, error.message));
        });

    if (!updatedAsk) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error deleting ask"));
    }

    // set the user's ticket to unlisted

    const updateListStatus = await prisma.ticket
        .update({
            where: {
                owner_id_event_id: {
                    owner_id: ask.owner_id,
                    event_id: ask.event_id,
                },
            },
            data: {
                listed: false
            }
        })
        .catch((error) => {
            return next(new RouterError(StatusCode.ClientErrorPreconditionFailed, "ticket deleted, error setting to unlisted", undefined, error.message));
        })

    if (!updateListStatus) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "ticket deleted, error setting to unlisted"));
    }

    // Send a success message
    return res.status(StatusCode.SuccessOK).json({
        success: true,
        message: "Ask successfully deleted"
    });
});

export default askRouter;
