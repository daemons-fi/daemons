import express, { Request, Response } from "express";
import { ScriptStats } from "../models/stats/script-stats";
import { TransactionStats } from "../models/stats/transaction-stats";
import { UserStats } from "../models/stats/user-stats";
import { ChainInfo } from "../stats";

export const statisticsRouter = express.Router();

statisticsRouter.get("/users/:chainId", async (req: Request, res: Response) => {
    var date = new Date();
    date.setMonth(date.getMonth() - 1);

    const chainName = ChainInfo()[req.params.chainId];
    if (!chainName) return res.status(400).send({ error: "Unsupported chain" });

    try {
        const stats = await UserStats.find({
            date: { $gte: date.toISOString().substring(0, 10) },
            chain: chainName
        }).lean();
        return res.status(200).send(stats);
    } catch (error) {
        return res.status(500).send(error);
    }
});

statisticsRouter.get("/scripts/:chainId", async (req: Request, res: Response) => {
    var date = new Date();
    date.setMonth(date.getMonth() - 1);

    const chainName = ChainInfo()[req.params.chainId];
    if (!chainName) return res.status(400).send({ error: "Unsupported chain" });

    try {
        const stats = await ScriptStats.find({
            date: { $gte: date.toISOString().substring(0, 10) },
            chain: chainName
        }).lean();
        return res.status(200).send(stats);
    } catch (error) {
        return res.status(500).send(error);
    }
});

statisticsRouter.get("/transactions/:chainId", async (req: Request, res: Response) => {
    var date = new Date();
    date.setMonth(date.getMonth() - 1);

    const chainName = ChainInfo()[req.params.chainId];
    if (!chainName) return res.status(400).send({ error: "Unsupported chain" });

    try {
        const stats = await TransactionStats.find({
            date: { $gte: date.toISOString().substring(0, 10) },
            chain: chainName
        }).lean();
        return res.status(200).send(stats);
    } catch (error) {
        return res.status(500).send(error);
    }
});
