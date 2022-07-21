import mongoose from 'mongoose';

const treasuryStatsSchema = new mongoose.Schema({
    date: { type: String, required: true },
    apr: { type: Number, required: true },
    treasury: { type: Number, required: true },
    staked: { type: Number, required: true },
    distributed: { type: Number, required: true },
    pol: { type: Number, required: true },
    chain: { type: String, required: true },
});

export interface ITreasuryStats {
    date: string;
    apr: number;
    treasury: number;
    staked: number;
    distributed: number;
    pol: number;
    chain: string;
}

export interface ITreasuryStatsDocument extends ITreasuryStats, mongoose.Document { }

interface ITreasuryStatsModelSchema extends mongoose.Model<ITreasuryStatsDocument> {
    build(treasuryStats: ITreasuryStats): ITreasuryStatsDocument;
}

treasuryStatsSchema.statics.build = (treasuryStats: ITreasuryStats) => new TreasuryStats(treasuryStats);
export const TreasuryStats = mongoose.model<ITreasuryStatsDocument, ITreasuryStatsModelSchema>('TreasuryStats', treasuryStatsSchema);
