import { CronJob } from "cron";
import { performDailyTreasuryOperations } from "./chain-proxy/daily-treasury-operations";
import { updateGasPrices } from "./chain-proxy/gas-price-feed-updater";
import { rootLogger } from "./logger";

export const scheduler = () => {
    const logger = rootLogger.child({source: "scheduler"});
    logger.debug({message: "scheduler started"})

    const cronjobs = [
        // gas prices are updated every 8 hours
        new CronJob("0 */8 * * *", () => updateGasPrices(), null, true, "UTC"),

        // treasury daily operations are done once a day
        new CronJob("0 8 * * *", () => performDailyTreasuryOperations(), null, true, "UTC"),
    ];

    cronjobs.forEach((cronjob) => {
        cronjob.start();
    });
};
