import express, { Request, Response } from "express";
import { Notification } from "../models/notification";
import { authenticate } from "../middlewares/authentication";

export const notificationsRouter = express.Router();

notificationsRouter.get("/", authenticate, async (req: Request, res: Response) => {
    if (!req.userAddress) {
        return res.sendStatus(403);
    }
    try {
        const notifications = await Notification.find({
            user: req.userAddress
        });
        return res.status(200).send(notifications);
    } catch (error) {
        return res.status(500).send(error);
    }
});

notificationsRouter.delete("/", authenticate, async (req: Request, res: Response) => {
    if (!req.userAddress) {
        return res.sendStatus(403);
    }

    try {
        await Notification.deleteMany({
            user: req.userAddress
        });
        return res.send();
    } catch (error) {
        return res.status(500).send(error);
    }
});