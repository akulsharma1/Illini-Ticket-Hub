import { Router, Request, Response } from "express";

const eventRouter: Router = Router();

eventRouter.get("/test", async (_: Request, res: Response) => {
    return res.status(200).json({ success: true });
});

export default eventRouter;
