import { Router, Request, Response } from "express";
import prisma from "../../lib/db";
import { RouterError } from "../../middleware/error-handler";
import StatusCode from "status-code-enum";
import { NextFunction } from "express-serve-static-core";

const accountRouter: Router = Router();

accountRouter.get("/test", async (_: Request, res: Response) => {
    return res.status(200).json({ success: true });
});

accountRouter.get("/profile", async (req: Request, res: Response, next: NextFunction) => {
    const profileId = req.query.id as string | undefined;

    if (!profileId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "profile id query parameter required"));
    }
    const profile = await prisma.account.findUnique({
        where: { account_id: Number(profileId) },
    });

    if (!profile) {
        return next(new RouterError(StatusCode.ClientErrorNotFound, "profile not found"));
    }

    return res.status(StatusCode.SuccessOK).json({ success: true, profile: profile });
});

accountRouter.get("/tickets", async (req: Request, res: Response, next: NextFunction) => {
    const profileId = req.query.id as string | undefined;

    if (!profileId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "profile id query parameter required"));
    }

    const tickets = await prisma.ticket.findMany({
        where: { owner_id: Number(profileId) },
    });

    return res.status(StatusCode.SuccessOK).json({ success: true, tickets: tickets });
});

accountRouter.get("/tickets/test", async (req: Request, res: Response, next: NextFunction) => {
    const profileId = req.query.id as string | undefined;

    if (!profileId) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "profile id query parameter required"));
    }

    const tickets = await prisma.ticket.findMany({
        where: { owner_id: Number(profileId) },
    });

    return res.status(StatusCode.SuccessOK).json({
        success: true,
        tickets: [
            {
                owner_id: Number(profileId),
                event_id: 2,
                used: false,
                listed: false,
                created_at: "2024-02-23T03:50:49.086Z",
            },
            {
                owner_id: Number(profileId),
                event_id: 3,
                used: false,
                listed: false,
                created_at: "2024-02-23T03:50:49.086Z",
            },
        ],
    });
});

accountRouter.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    
});

export default accountRouter;
