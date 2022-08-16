import { CronJob } from "cron";
import { performDailyTreasuryOperations } from "./cronjobs/daily-treasury-operations";
import { updateGasPrices } from "./cronjobs/gas-price-feed-updater";
import { sendDailyReport } from "./cronjobs/send-daily-report";
import { rootLogger } from "./logger";

export const scheduler = () => {
    const logger = rootLogger.child({ source: "scheduler" });
    logger.debug({ message: "scheduler started" });

    const cronjobs = [
        // gas prices are updated every 8 hours
        new CronJob("0 */8 * * *", () => updateGasPrices(), null, true, "UTC"),

        // treasury daily operations are done once a day
        new CronJob("0 8 * * *", () => performDailyTreasuryOperations(), null, true, "UTC"),

        // Report sent every day at 18.00 UTC (20.00 CET)
        new CronJob("0 18 * * *", () => sendDailyReport(), null, true, "UTC"),
    ];

    cronjobs.forEach((cronjob) => {
        cronjob.start();
    });
};
