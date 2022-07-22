import { CronJob } from "cron";
import { performDailyTreasuryOperations } from "./chain-proxy/daily-treasury-operations";
import { updateGasPrices } from "./chain-proxy/gas-price-feed-updater";

export const scheduler = () => {
    console.log("Admin scheduler started");

    const cronjobs = [
        // gas prices are updated every 8 hours
        new CronJob("0 */8 * * *", () => updateGasPrices(), null, true, "UTC"),

        // treasury daily operations are done once a day
        new CronJob("0 8 * * *", () => performDailyTreasuryOperations(), null, true, "UTC"),
    ];

    cronjobs.forEach((cronjob) => {
        console.log("Next job time:", cronjob.nextDates().toISOString());
        cronjob.start();
    });
};
