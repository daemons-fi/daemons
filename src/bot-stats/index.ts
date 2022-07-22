import { updateScriptStats } from "./stats/script-stats-updater";
import { updateTransactionStats } from "./stats/transactions-stats-updater";
import { updateUserStats } from "./stats/user-stats-updater";

/**
 * ## Statistics Bot 🤖🪓
 *
 * The Statistics bot (Charles) is triggered multiple times a day to generate stats
 * about Daemons.
 */
export class StatisticsBot {
    public static execute = async (): Promise<void> => {
        console.log({ source: "[🤖📊 Statistics Bot]", message: "starting" });

        await updateUserStats();
        console.log({ source: "[🤖📊 Statistics Bot]", message: "User stats updated" });

        await updateScriptStats();
        console.log({ source: "[🤖📊 Statistics Bot]", message: "Script stats updated" });

        await updateTransactionStats();
        console.log({ source: "[🤖📊 Statistics Bot]", message: "Transaction stats updated" });
    };
}
