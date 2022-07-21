import { NextFunction, Request, Response } from "express";

const corsWhitelist: Set<string> = new Set([
    "http://localhost:3000",
    "https://app.daemons.fi",
]);

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
