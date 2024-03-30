import express, { Application } from "express";
import { Request, Response } from "express";
import accountRouter from "./services/account/account-router";
import eventRouter from "./services/event/event-router";
import dashboardRouter from "./services/dashboard/dashboard-router";
import { ErrorHandler } from "./middleware/error-handler";
import cors from "cors";
import transferRouter from "./services/marketplace/transfer/transfer-router";
import bidRouter from "./services/marketplace/bid/bid-router";
import askRouter from "./services/marketplace/ask/ask-router";

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use("/account/", accountRouter);
app.use("/events/", eventRouter);
app.use("/bids/", bidRouter);
app.use("/asks/", askRouter);
app.use("/dashboard/", dashboardRouter);
app.use("/transfer/", transferRouter);

app.get("/", (_: Request, res: Response) => {
    res.end("API is working!!!");
});

app.use(ErrorHandler);

export default app;
