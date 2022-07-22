import { rootLogger } from "../logger";
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
        const logger = rootLogger.child({source: "Statistics Bot"});
        logger.debug({ message: "starting" });

        await updateUserStats();
        logger.debug({ message: "User stats updated" });

        await updateScriptStats();
        logger.debug({ message: "Script stats updated" });

        await updateTransactionStats();
        logger.debug({ message: "Transaction stats updated" });
    };
}
