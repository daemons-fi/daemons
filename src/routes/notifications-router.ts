import express, { Request, Response } from "express";
import { Notification } from "@daemons-fi/db-schema";
import { authenticate } from "../middlewares/authentication";
import { rootLogger } from "../logger";

const routerLogger = rootLogger.child({source: "notificationsRouter"});
export const notificationsRouter = express.Router();

notificationsRouter.get("/", authenticate, async (req: Request, res: Response) => {
    if (!req.userAddress) {
        return res.sendStatus(403);
    }
    try {
        const notifications = await Notification.find({
            user: req.userAddress
        }).lean();
        return res.status(200).send(notifications);
    } catch (error) {
        routerLogger.error({ message: "endpoint error", endpoint: "GET /", error });
        return res.status(500).send(error);
    }
});

notificationsRouter.post("/", authenticate, async (req: Request, res: Response) => {
    if (!req.userAddress) {
        return res.sendStatus(403);
    }

    try {
        await Notification.deleteMany({ id: { $in: req.body.ids }, user: req.userAddress });
        return res.status(200).send();
    } catch (error) {
        routerLogger.error({ message: "endpoint error", endpoint: "POST /", error });
        return res.status(500).send(error);
    }
});
