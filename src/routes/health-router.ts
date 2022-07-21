import express, { Request, Response } from "express";

export const healthRouter = express.Router();

healthRouter.get("/health", async (req: Request, res: Response) => {
    return res.sendStatus(200);
});
