import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { scriptsRouter } from "./routes/scripts-router";
import { authenticationRouter } from "./routes/authentication-router";
import { corsWhitelisting } from "./middlewares/cors-whitelisting";
import { transactionsRouter } from "./routes/transactions-router";
import { statisticsRouter } from "./routes/statistics-router";
import { notificationsRouter } from "./routes/notifications-router";
import { healthRouter } from "./routes/health-router";

dotenv.config();

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET was not set");
if (!process.env.MONGO_DB_CONN_STRING) throw new Error("MONGO_DB_CONN_STRING was not set");

export const app = express();

app.use(corsWhitelisting);
app.use(express.json());
app.use(cookieParser());

app.use(healthRouter);
app.use("/api/auth", authenticationRouter);
app.use("/api/scripts", scriptsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/stats", statisticsRouter);
app.use("/api/notifications", notificationsRouter);
