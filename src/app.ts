import express from "express";
import dotenv from "dotenv";
import { healthRouter } from "./routes/health";

dotenv.config();

if (!process.env.MONGO_DB_CONN_STRING) throw new Error("MONGO_DB_CONN_STRING was not set");
if (!process.env.KOVAN_RPC) throw new Error("KOVAN_RPC was not set");
if (!process.env.MUMBAI_RPC) throw new Error("MUMBAI_RPC was not set");

export const app = express();
app.use(healthRouter);
