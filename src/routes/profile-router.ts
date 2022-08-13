import express, { Request, Response } from "express";
import { authenticate } from "../middlewares/authentication";
import { User } from "@daemons-fi/db-schema";
import { rootLogger } from "../logger";

const routerLogger = rootLogger.child({ source: "profileRouter" });
export const profileRouter = express.Router();

profileRouter.post("/username", authenticate, async (req: Request, res: Response) => {
    try {
        const { username } = req.body;
        const caseInsensitiveUsername = RegExp(`^${username}$`, "i");
        if (await User.findOne({ username: { $regex: caseInsensitiveUsername } })) {
            return res.status(400).send("Username not available");
        }

        await User.updateOne({ address: req.userAddress }, { $set: { username } });
        return res.sendStatus(200);
    } catch (error) {
        routerLogger.error({ message: "endpoint error", endpoint: "/username", error });
        return res.status(500).send(error);
    }
});

profileRouter.post("/show-tutorial-tooltip", authenticate, async (req: Request, res: Response) => {
    try {
        const { value } = req.body;
        await User.updateOne({ address: req.userAddress }, { $set: { showTutorial: value } });
        return res.sendStatus(200);
    } catch (error) {
        routerLogger.error({ message: "endpoint error", endpoint: "/username", error });
        return res.status(500).send(error);
    }
});
