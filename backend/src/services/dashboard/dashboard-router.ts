import { Router, Request, Response } from "express";

const dashboardRouter: Router = Router();

dashboardRouter.get("/test", async (_: Request, res: Response) => {
    return res.status(200).json({ success: true });
});
export default dashboardRouter;
