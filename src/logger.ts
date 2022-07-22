import pino from "pino";

export const rootLogger = pino({
    name: "admin",
    level: "debug"
}).child({ source: "root" });
