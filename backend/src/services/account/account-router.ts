import { Router, Request, Response } from "express";
import prisma from "../../lib/db";
import { RouterError } from "../../middleware/error-handler";
import StatusCode from "status-code-enum";
import { NextFunction } from "express-serve-static-core";
import { Account } from "@prisma/client";
import { decodeWithPrivateKey, encodeWithPublicKey } from "./account-helpers";
import { rsaPrivateKey, rsaPublicKey } from "../../lib/rsa";
import { isValidAccountFormat, isValidSigninAccountFormat } from "./account-formats";

const accountRouter: Router = Router();

accountRouter.get("/test", async (_: Request, res: Response) => {
    return res.status(200).json({ success: true });
});

// GET profile details
accountRouter.get("/profile", async (req: Request, res: Response, next: NextFunction) => {
    const profileId = req.query.id as string | undefined;

    if (!profileId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "profile id query parameter required"));
    }
    const profile = await prisma.account.findUnique({
        where: { account_id: Number(profileId) },
        select: {
            account_id: true,
            email_address: true,
            name: true,
            created_at: true,
        },
    });

    if (!profile) {
        return next(new RouterError(StatusCode.ClientErrorNotFound, "profile not found"));
    }

    return res.status(StatusCode.SuccessOK).json({ success: true, profile: profile });
});

// GET tickets for a given account
accountRouter.get("/tickets", async (req: Request, res: Response, next: NextFunction) => {
    const profileId = req.query.id as string | undefined;

    if (!profileId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "profile id query parameter required"));
    }

    const tickets = await prisma.ticket.findMany({
        where: { owner_id: Number(profileId) },
    });

    // map each ticket to its event id
    const ticketEventIds = tickets.map((ticket) => ticket.event_id);

    // for every ticket event id, find the event details for it
    const events = await prisma.event.findMany({
        where: {
            event_id: {
                in: ticketEventIds,
            },
        },
    });

    // map the event to its eventid
    const eventMap = new Map(events.map((event) => [event.event_id, event]));

    // Update each ticket with its corresponding event
    const updatedTickets = tickets.map((ticket) => ({
        ...ticket,
        event: eventMap.get(ticket.event_id),
    }));

    return res.status(StatusCode.SuccessOK).json({ success: true, tickets: updatedTickets });
});

// create account
accountRouter.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    const account: Account = req.body as Account;
    console.log(account);

    if (!isValidAccountFormat(account)) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid account creation params"));
    }

    try {
        await prisma.account.create({
            data: {
                email_address: account.email_address,
                // encode password before making sql insert query
                password: encodeWithPublicKey(account.password, rsaPublicKey),
                name: account.name,
            },
        });
    } catch (error) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error creating account", undefined, error));
    }

    return res.status(StatusCode.SuccessOK).json({ success: true, message: "created account" });
});

// endpoint to sign into account
accountRouter.post("/sign-in", async (req: Request, res: Response, next: NextFunction) => {
    const account: Account = req.body as Account;

    if (!isValidSigninAccountFormat(account)) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid account creation params"));
    }

    try {
        const profile = await prisma.account.findUnique({
            where: { email_address: account.email_address },
        });

        if (!profile) {
            return next(new RouterError(StatusCode.ClientErrorBadRequest, "email doesn't exist"));
        }

        // check if decoded password == inputted password
        if (decodeWithPrivateKey(profile.password, rsaPrivateKey) !== account.password) {
            return next(new RouterError(StatusCode.ClientErrorUnprocessableEntity, "invalid password"));
        }

        return res.status(StatusCode.SuccessOK).json({
            success: true,
            message: "logged into account",
            profile: {
                account_id: profile.account_id,
                email_address: profile.email_address,
                name: profile.name,
            },
        });
    } catch (e) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "error signing in", undefined, e));
    }
});

// GET bids for a given account
accountRouter.get("/bids", async (req: Request, res: Response, next: NextFunction) => {
    const profileId = req.query.id as string | undefined;

    if (!profileId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "profile id query parameter required"));
    }

    const bids = await prisma.bid.findMany({
        where: { owner_id: Number(profileId) },
    });

    const count = bids.length;

    return res.status(StatusCode.SuccessOK).json({ success: true, bids: bids, count: count });
});

// GET asks for a given account
accountRouter.get("/asks", async (req: Request, res: Response, next: NextFunction) => {
    const profileId = req.query.id as string | undefined;

    if (!profileId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "profile id query parameter required"));
    }

    const asks = await prisma.ask.findMany({
        where: { owner_id: Number(profileId) },
    });

    const count = asks.length;

    return res.status(StatusCode.SuccessOK).json({ success: true, asks: asks, count: count });
});

// create ticket
accountRouter.post("/create-ticket", async (req: Request, res: Response, next: NextFunction) => {
    const accountIdStr: string = req.body.account_id;
    const eventIdStr: string = req.body.event_id;

    if (!accountIdStr || !eventIdStr) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid ticket creation params"));
    }

    const accountId = Number(accountIdStr);
    const eventId = Number(eventIdStr);

    if (isNaN(accountId) && isNaN(eventId)) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid ticket creation params"));
    }

    const ticket = await prisma.ticket.findUnique({
        where: {
            owner_id_event_id: {
                owner_id: accountId,
                event_id: eventId,
            },
        },
    });

    if (ticket) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "already has ticket"));
    }

    try {
        await prisma.ticket.create({
            data: {
                owner_id: accountId,
                event_id: eventId,
            },
        });
    } catch (error) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error creating ticket", undefined, error));
    }

    return res.status(StatusCode.SuccessOK).json({ success: true, message: "created ticket" });
});

// GET asks for a given account for a given event
accountRouter.get("/userask/:event_id/:profile_id", async (req: Request, res: Response, next: NextFunction) => {
    // const profileId = req.query.id as string | undefined;
    const eventIdStr: string = req.params.event_id;

    const profileId: string = req.params.profile_id;

    if (!eventIdStr) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "event_id URL parameter required"));
    }

    const eventId = Number(eventIdStr);

    if (!profileId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "profile id query parameter required"));
    }

    const ask = await prisma.ask.findUnique({
        where: {
            owner_id_event_id: {
                event_id: eventId,
                owner_id: Number(profileId),
            },
        },
    });

    let askPriceResponse = -1;

    if (ask) {
        askPriceResponse = Number(ask.price);
    }

    return res.status(StatusCode.SuccessOK).json({ success: true, CurrentAsk: askPriceResponse });
});

accountRouter.get("/userbid/:event_id/:profile_id", async (req: Request, res: Response, next: NextFunction) => {
    // const profileId = req.query.id as string | undefined;
    const eventIdStr: string = req.params.event_id;

    const profileId: string = req.params.profile_id;

    if (!eventIdStr) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "event_id URL parameter required"));
    }

    const eventId = Number(eventIdStr);

    if (!profileId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "profile id query parameter required"));
    }

    const bid = await prisma.bid.findUnique({
        where: {
            owner_id_event_id: {
                event_id: eventId,
                owner_id: Number(profileId),
            },
        },
    });

    let bidPriceResponse = -1;

    if (bid) {
        bidPriceResponse = Number(bid.price);
    }

    return res.status(StatusCode.SuccessOK).json({ success: true, CurrentBid: bidPriceResponse });
});

export default accountRouter;
