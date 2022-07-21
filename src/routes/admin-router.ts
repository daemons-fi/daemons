import express, { Request, Response } from "express";
import { authenticateAdmin } from "../middlewares/authentication";
import { ITreasuryStats, TreasuryStats } from "../models/stats/treasury-stats";
import { updateScriptStats } from "../stats/script-stats-updater";
import { updateTransactionStats } from "../stats/transactions-stats-updater";
import { updateUserStats } from "../stats/user-stats-updater";

export const adminRouter = express.Router();

adminRouter.post("/update-stats", authenticateAdmin, async (req: Request, res: Response) => {
    try {
        console.log('Stats updating started...');

        await updateUserStats();
        console.log('User stats updated');

        await updateScriptStats();
        console.log('Script stats updated');

        await updateTransactionStats();
        console.log('Transaction stats updated');

        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error);
    }
});

adminRouter.post("/treasury-stats", authenticateAdmin, async (req: Request, res: Response) => {
    // delete all stats from today to prevent duplicates
    const today = new Date().toISOString().slice(0, 10);
    await TreasuryStats.deleteMany({ date: today });

    try {
        const stats: ITreasuryStats[] = req.body;
        stats.forEach(stat => stat.date = today);

        await TreasuryStats.insertMany(stats);
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});
