import { Router, Request, Response } from "express";

const buyRouter: Router = Router();

buyRouter.get("/test", async (_: Request, res: Response) => {
    return res.status(200).json({ success: true });
});

export default buyRouter;
