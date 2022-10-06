import { Script, UserStats } from "@daemons-fi/db-schema";
import { supportedChainsList } from "../../utils/providers-builder";


export async function updateUserStats(): Promise<void> {
    // delete all stats from today to prevent duplicates
    const today = new Date().toISOString().slice(0, 10);
    await UserStats.deleteMany({ date: today });

    // prepare and insert the stats for each chain
    for (let chainId of supportedChainsList()) {
        await updateUserStatsForChain(chainId);
    }
}

async function updateUserStatsForChain(chainId: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const nrUsers = await Script.find({chainId}).distinct('user');
    if (nrUsers.length === 0) return;

    await UserStats.build({
        amount: nrUsers.length,
        chainId: chainId,
        date: today,
    }).save();
}
