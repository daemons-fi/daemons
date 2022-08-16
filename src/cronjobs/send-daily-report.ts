import { bigNumberToFloat } from "@daemons-fi/contracts/build";
import fetch from "cross-fetch";
import { rootLogger } from "../logger";
import { DailyStats } from "../models/daily-stats";
import { getProvider, IChainWithContracts, supportedChains } from "./utils/providers-builder";

const logger = rootLogger.child({ source: "DailyReport" });

export async function sendDailyReport(): Promise<void> {
    const reports: string[] = [];
    for (const chain of Object.values(supportedChains)) {
        reports.push(await getDailyReportForChain(chain));
    }
    await callWebhook(reports.join("\n\n------------------------\n\n"));
}

const callWebhook = async (content: string): Promise<void> => {
    const response = await fetch(process.env.DISCORD_DAILY_REPORT_WEBHOOK!, {
        method: "post",
        body: JSON.stringify({ content }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (response.status === 204) {
        logger.debug({ message: `Sent daily report to Discord webhook` });
    } else {
        logger.error({
            message: `Failed sending of daily report to Discord webhook`,
            content,
            status: response.status
        });
    }
};

const getDailyReportForChain = async (chain: IChainWithContracts): Promise<string> => {
    const dailyStat = await DailyStats.fetchOrCreate(chain.name);
    const provider = getProvider(chain.id);
    const balance = await provider.getBalance(process.env.ADMIN_WALLET_ADDRESS!);

    return `**Chain: ${chain.name}**
    Balance: ${bigNumberToFloat(balance, 6)}

    _Gas Oracle_
    Updated ${dailyStat.gasOracleUpdates} times
    gas spent: ${dailyStat.gasOracleCost}

    _Treasury_
    Commissions claimed: ${dailyStat.treasuryCommissionClaimed}
    Added to LP: ${dailyStat.treasuryAddedToLP}
    buybacks: ${dailyStat.treasuryBuybacks}
    gas spent: ${dailyStat.treasuryManagementCost}`;
};
