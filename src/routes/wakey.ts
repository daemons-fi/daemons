import express, { Request, Response } from "express";

export const wakeyRouter = express.Router();

wakeyRouter.get("/wakey", async (req: Request, res: Response) => {
    return res.status(200).send("I'm awake!");
});
