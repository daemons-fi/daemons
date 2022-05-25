import express, { Request, Response } from "express";
import { utils } from "ethers";
import { Notification } from "../models/notification";
import { authenticate } from "../middlewares/authentication";

export const notificationsRouter = express.Router();

notificationsRouter.get("/:userAddress", authenticate, async (req: Request, res: Response) => {
    if (!req.params.userAddress) return res.status(400).send({ error: "Missing user" });
    const userAddress = utils.getAddress(req.params.userAddress);
    if (req.userAddress !== userAddress) {
        return res.sendStatus(403);
    }

    try {
        const notifications = await Notification.find({
            user: userAddress
        });
        return res.status(200).send(notifications);
    } catch (error) {
        return res.status(500).send(error);
    }
});

notificationsRouter.delete("/:userAddress", authenticate, async (req: Request, res: Response) => {
    if (!req.params.userAddress) return res.status(400).send({ error: "Missing user" });
    const userAddress = utils.getAddress(req.params.userAddress);
    if (req.userAddress !== userAddress) {
        return res.sendStatus(403);
    }

    try {
        await Notification.deleteMany({
            user: userAddress
        });
        return res.send();
    } catch (error) {
        return res.status(500).send(error);
    }
});