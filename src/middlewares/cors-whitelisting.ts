import { NextFunction, Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

const devCORS = ["http://localhost:3000", "http://localhost:3333"];
const prodCORS = ["https://app.daemons.fi", "https://execute.daemons.fi"];

const corsWhitelist: Set<string> = new Set(isProduction ? prodCORS : devCORS);

/**
 * If the origin is in `corsWhitelist`, we allow CORS in all responses.
 */
export function corsWhitelisting(req: Request, res: Response, next: NextFunction) {
    if (corsWhitelist.has(req.headers.origin!)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        );
        res.header("Access-Control-Allow-Credentials", "true");
    }

    next();
}
