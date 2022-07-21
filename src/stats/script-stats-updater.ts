import { IScriptStats, ScriptStats } from "../models/stats/script-stats";
import { ChainInfo } from ".";
import { Script } from "../models/scripts/script";

export async function updateScriptStats(): Promise<void> {
    // delete all stats from today to prevent duplicates
    const today = new Date().toISOString().slice(0, 10);
    await ScriptStats.deleteMany({ date: today });

    // prepare and insert the stats for each chain
    const chains = Object.keys(ChainInfo());
    for (let chainId of chains) {
        await updateScriptStatsForChain(chainId);
    }
}

async function updateScriptStatsForChain(chainId: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const chainName = ChainInfo()[chainId];

    const scriptsCounts = await Script.aggregate([
        { $match: { chainId: chainId } },
        { $group: { _id: "$__type", count: { $sum: 1 } } }
    ]);

    let todaysStatsForThisChain: IScriptStats[] = scriptsCounts.map(c => ({
        amount: c.count,
        chain: chainName,
        date: today,
        kind: c._id.substring(c._id.length - 6, 0) // remove 'Script' from script type
    }));

    await ScriptStats.insertMany(todaysStatsForThisChain);
}
