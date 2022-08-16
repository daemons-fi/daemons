import mongoose from "mongoose";

const dailyStatsSchema = new mongoose.Schema({
    date: { type: String, required: true },
    chain: { type: String, required: true },
    gasOracleUpdates: { type: Number, required: false, default: 0 },
    gasOracleCost: { type: Number, required: false, default: 0 },
    treasuryCommissionClaimed: { type: Number, required: false, default: 0 },
    treasuryAddedToLP: { type: Number, required: false, default: 0 },
    treasuryBuybacks: { type: Number, required: false, default: 0 },
    treasuryManagementCost: { type: Number, required: false, default: 0 }
});

export interface IDailyStats {
    date: string;
    chain: string;
    gasOracleUpdates: number;
    gasOracleCost: number;
    treasuryCommissionClaimed: number;
    treasuryAddedToLP: number;
    treasuryBuybacks: number;
    treasuryManagementCost: number;
}

export interface IDailyStatsDocument extends IDailyStats, mongoose.Document {}

interface IDailyStatsModelSchema extends mongoose.Model<IDailyStatsDocument> {
    fetchOrCreate(chain: string): Promise<IDailyStatsDocument>;
}

dailyStatsSchema.statics.fetchOrCreate = async (chain: string) => {
    const date = new Date().toISOString().substring(0, 10);
    let todaysStats = await DailyStats.findOne({ date, chain });
    return todaysStats ?? (await new DailyStats({ date, chain }).save());
};
export const DailyStats = mongoose.model<IDailyStatsDocument, IDailyStatsModelSchema>(
    "DailyStats",
    dailyStatsSchema
);
