import { SwapScript } from "../models/scripts/swap-script";
import { TransferScript } from "../models/scripts/transfer-script";
import { MmBaseScript } from "../models/scripts/mm-base-script";
import { ChainInfo } from ".";
import { UserStats } from "../models/stats/user-stats";


export async function updateUserStats(): Promise<void> {
    // delete all stats from today to prevent duplicates
    const today = new Date().toISOString().slice(0, 10);
    await UserStats.deleteMany({ date: today });

    // prepare and insert the stats for each chain
    const chains = Object.keys(ChainInfo());
    for (let chainId of chains) {
        await updateUserStatsForChain(chainId);
    }
}

async function updateUserStatsForChain(chainId: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const chainName = ChainInfo()[chainId];

    const distinctAcrossAllScriptTypes = new Set([
        ...(await SwapScript.find({ chainId }).distinct('user').lean()),
        ...(await TransferScript.find({ chainId }).distinct('user').lean()),
        ...(await MmBaseScript.find({ chainId }).distinct('user').lean()),
    ])

    if (distinctAcrossAllScriptTypes.size === 0) return;

    await UserStats.build({
        amount: distinctAcrossAllScriptTypes.size,
        chain: chainName,
        date: today,
    }).save();
}
