import { CronJob } from "cron";
import { updateGasPrices } from "../chain-proxy/gas-price-feed-updater";
import { updateStorageStats } from "./update-storage-stats";
import { updateTreasuryStats } from "./update-treasury-stats";

export const scheduler = () => {
    console.log("Admin scheduler started");

    const cronjobs = [
        // stats are updated twice a day, at 7.40 and 19.40
        new CronJob("40 7 * * *", () => updateStorageStats(), null, true, "UTC"),
        new CronJob("40 19 * * *", () => updateStorageStats(), null, true, "UTC"),
        new CronJob("40 7 * * *", () => updateTreasuryStats(), null, true, "UTC"),
        new CronJob("40 19 * * *", () => updateTreasuryStats(), null, true, "UTC"),

        // gas prices are updated every 8 hours
        new CronJob("0 */8 * * *", () => updateGasPrices(), null, true, "UTC"),
    ];

    cronjobs.forEach((cronjob) => {
        console.log("Next job time:", cronjob.nextDates().toISOString());
        cronjob.start();
    });
};
