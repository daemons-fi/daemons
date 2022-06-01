import express from "express";
import dotenv from "dotenv";
import { wakeyRouter } from "./routes/wakey";
import { updateGasPrices } from "./chain-proxy/gas-price-feed-updater";

dotenv.config();

if (!process.env.ADMIN_KEY) throw new Error("ADMIN_KEY was not set");
if (!process.env.STORAGE_ENDPOINT) throw new Error("STORAGE_ENDPOINT was not set");

if (!process.env.KOVAN_RPC) throw new Error("KOVAN_RPC was not set");
if (!process.env.RINKEBY_RPC) throw new Error("RINKEBY_RPC was not set");
if (!process.env.FANTOM_TESTNET_RPC) throw new Error("FANTOM_TESTNET_RPC was not set");

export const app = express();

app.use(wakeyRouter);

updateGasPrices();
