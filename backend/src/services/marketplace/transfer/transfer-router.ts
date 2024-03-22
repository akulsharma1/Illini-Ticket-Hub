import { Router, Request, Response } from "express";
import { Ticket } from "@prisma/client";
import { checkIfNewOwnerAlreadyOwnsTicket, checkIfTransferrableTicket, transferOwnership } from "./transfer-helpers";
import { TransferModel } from "./transfer-model";
import { NextFunction } from "express-serve-static-core";
import { RouterError } from "../../../middleware/error-handler";
import StatusCode from "status-code-enum";
import prisma from "../../../lib/db";

const transferRouter: Router = Router();

transferRouter.post("/ticket/", async (req: Request, res: Response, next: NextFunction) => {
    const transferData: TransferModel = req.body as TransferModel;

    if (!transferData.event_id || !transferData.owner_id || !transferData.new_owner_id) {
        return next(new RouterError(StatusCode.ClientErrorBadRequest, "invalid transfer parameters"));
    }

    const ticket: Ticket = await prisma.ticket.findUnique({
        where: {
            owner_id_event_id: {
                owner_id: transferData.owner_id,
                event_id: transferData.event_id,
            },
        },
    });

    if (!ticket) {
        return next(new RouterError(StatusCode.ClientErrorNotFound, "ticket not found"));
    }

    const transferrable = await checkIfTransferrableTicket(ticket);

    if (!transferrable) {
        return next(new RouterError(StatusCode.ClientErrorPreconditionFailed, "ticket not transferrable"));
    }

    const newOwnerOwnsTicket = await checkIfNewOwnerAlreadyOwnsTicket(transferData.new_owner_id, transferData.event_id);
    if (newOwnerOwnsTicket) {
        return next(new RouterError(StatusCode.ClientErrorPreconditionFailed, "new owner already owns ticket"));
    }

    const transfer = await transferOwnership(ticket, transferData.new_owner_id);

    if (!transfer) {
        return next(new RouterError(StatusCode.ServerErrorInternal, "error transferring ticket"));
    }

    return res.status(200).json({ success: true, message: "successfully transferred ticket" });
});

export default transferRouter;
