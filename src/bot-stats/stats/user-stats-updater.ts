import { ChainInfo } from ".";
import { Script, UserStats } from "@daemons-fi/db-schema";


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

    const nrUsers = await Script.find({chainId}).distinct('user');
    if (nrUsers.length === 0) return;

    await UserStats.build({
        amount: nrUsers.length,
        chain: chainName,
        date: today,
    }).save();
}
