import pino from "pino";

export const rootLogger = pino({
    name: "daemonic-bots",
    level: "debug"
}).child({ source: "root" });
