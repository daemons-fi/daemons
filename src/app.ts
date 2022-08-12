import express from "express";
import dotenv from "dotenv";
import { healthRouter } from "./routes/health";

dotenv.config();

if (!process.env.ADMIN_WALLET_PRIVATE_KEY) throw new Error("ADMIN_WALLET_PRIVATE_KEY was not set");

if (!process.env.KOVAN_RPC) throw new Error("KOVAN_RPC was not set");
if (!process.env.FANTOM_TESTNET_RPC) throw new Error("FANTOM_TESTNET_RPC was not set");
if (!process.env.MUMBAI_RPC) throw new Error("MUMBAI_RPC was not set");

export const app = express();

app.use(healthRouter);
