import express, { Application } from "express";
import { Request, Response } from "express";
import accountRouter from "./services/account/account-router";
import eventRouter from "./services/event/event-router";
import buyRouter from "./services/marketplace/buy/buy-router";
import sellRouter from "./services/marketplace/sell/sell-router";
import dashboardRouter from "./services/dashboard/dashboard-router";
import { ErrorHandler } from "./middleware/error-handler";

const app: Application = express();

app.use(express.json());

app.use("/account/", accountRouter);
app.use("/events/", eventRouter);
app.use("/buy/", buyRouter);
app.use("/sell/", sellRouter);
app.use("/dashboard/", dashboardRouter);

app.get("/", (_: Request, res: Response) => {
    res.end("API is working!!!");
});

app.use(ErrorHandler);

export default app;
