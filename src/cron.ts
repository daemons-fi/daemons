import { CronJob } from "cron";
import { StatisticsBot } from "./bot-stats";
import { TerminatorBot } from "./bot-terminator";
import { TxAdderBot } from "./bot-tx-adder";
import { rootLogger } from "./logger";

export const scheduler = () => {
    const logger = rootLogger.child({source: "scheduler"});
    logger.debug({message: "scheduler started"})

    const cronjobs = [
        // Bots run every 10 minutes
        new CronJob("*/10 * * * *", () => TerminatorBot.execute(), null, true, "UTC"),

        // stats are updated thrice a day
        new CronJob("0 */8 * * *", () => StatisticsBot.execute(), null, true, "UTC"),
    ];

    cronjobs.forEach((cronjob) => {
        cronjob.start();
    });

    // Tx-Adder Bot listens in the background
    TxAdderBot.execute();
};
