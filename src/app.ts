import express from "express";
import dotenv from "dotenv";
import { healthRouter } from "./routes/health";

dotenv.config();

if (!process.env.ADMIN_WALLET_ADDRESS) throw new Error("ADMIN_WALLET_ADDRESS was not set");
if (!process.env.ADMIN_WALLET_PRIVATE_KEY) throw new Error("ADMIN_WALLET_PRIVATE_KEY was not set");
if (!process.env.DISCORD_DAILY_REPORT_WEBHOOK) throw new Error("DISCORD_DAILY_REPORT_WEBHOOK was not set");

if (!process.env.KOVAN_RPC) throw new Error("KOVAN_RPC was not set");
if (!process.env.MUMBAI_RPC) throw new Error("MUMBAI_RPC was not set");

export const app = express();

app.use(healthRouter);
