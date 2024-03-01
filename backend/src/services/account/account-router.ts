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

accountRouter.get("/profile", async (req: Request, res: Response, next: NextFunction) => {});

export default accountRouter;
