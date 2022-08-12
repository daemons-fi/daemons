import express, { Request, Response } from "express";
import { ScriptStats } from "@daemons-fi/db-schema";
import { TransactionStats } from "@daemons-fi/db-schema";
import { UserStats } from "@daemons-fi/db-schema";
import { rootLogger } from "../logger";

const routerLogger = rootLogger.child({ source: "statisticsRouter" });

export const statisticsRouter = express.Router();

statisticsRouter.get("/users/:chainId", async (req: Request, res: Response) => {
    var date = new Date();
    date.setMonth(date.getMonth() - 1);

    try {
        const stats = await UserStats.find({
            date: { $gte: date.toISOString().substring(0, 10) },
            chainId: req.params.chainId
        }).lean();

        res.set("Cache-control", "public, max-age=10800");
        return res.status(200).send(stats);
    } catch (error) {
        routerLogger.error({ message: "endpoint error", endpoint: "/users/:chainId", error });
        return res.status(500).send(error);
    }
});

statisticsRouter.get("/scripts/:chainId", async (req: Request, res: Response) => {
    var date = new Date();
    date.setMonth(date.getMonth() - 1);

    try {
        const stats = await ScriptStats.find({
            date: { $gte: date.toISOString().substring(0, 10) },
            chainId: req.params.chainId
        }).lean();

        res.set("Cache-control", "public, max-age=10800");
        return res.status(200).send(stats);
    } catch (error) {
        routerLogger.error({ message: "endpoint error", endpoint: "/scripts/:chainId", error });
        return res.status(500).send(error);
    }
});

statisticsRouter.get("/transactions/:chainId", async (req: Request, res: Response) => {
    var date = new Date();
    date.setMonth(date.getMonth() - 1);

    try {
        const stats = await TransactionStats.find({
            date: { $gte: date.toISOString().substring(0, 10) },
            chainId: req.params.chainId
        }).lean();

        res.set("Cache-control", "public, max-age=10800");
        return res.status(200).send(stats);
    } catch (error) {
        routerLogger.error({
            message: "endpoint error",
            endpoint: "/transactions/:chainId",
            error
        });
        return res.status(500).send(error);
    }
});
