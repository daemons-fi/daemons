import { ITransactionStats, Transaction, TransactionStats } from "@daemons-fi/db-schema";
import { ChainInfo } from ".";

export async function updateTransactionStats(): Promise<void> {
    // add today's partials statistics
    const today = new Date();
    await updateTransactionsStatsForDate(today);

    // and update yesterday's with the full results
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    await updateTransactionsStatsForDate(yesterday);
}

async function updateTransactionsStatsForDate(date: Date): Promise<void> {
    // delete all stats from the given date to prevent duplicates
    const yyyymmdd = date.toISOString().slice(0, 10);
    await TransactionStats.deleteMany({ date: yyyymmdd });

    // prepare and insert the stats for each chain
    const chains = Object.keys(ChainInfo());
    for (let chainId of chains) {
        await updateTransactionsStatsForChainAndDay(chainId, date);
    }
}

async function updateTransactionsStatsForChainAndDay(chainId: string, date: Date): Promise<void> {
    const chainName = ChainInfo()[chainId];

    var start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    var end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    const groupedTransactions = await Transaction.aggregate([
        {
            $match: {
                date: { $gte: start, $lt: end },
                chainId: chainId
            }
        },
        {
            $group: {
                _id: "$scriptType",
                count: { $sum: 1 }
            }
        }
    ]);

    const preppedTransactions = groupedTransactions.map(
        (group) =>
            ({
                chain: chainName,
                amount: group.count,
                date: start.toISOString().slice(0, 10),
                kind: group._id
            } as ITransactionStats)
    );

    // insert into db
    await TransactionStats.insertMany(preppedTransactions);
}
