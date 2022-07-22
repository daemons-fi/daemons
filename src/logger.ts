import pino from "pino";

export const rootLogger = pino({
    name: "storage",
    level: "debug"
}).child({ source: "root" });
