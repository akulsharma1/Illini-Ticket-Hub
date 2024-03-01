import { Router, Request, Response } from "express";

const sellRouter: Router = Router();

sellRouter.get("/test", async (_: Request, res: Response) => {
    return res.status(200).json({ success: true });
});

export default sellRouter;
