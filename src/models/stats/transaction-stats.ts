import mongoose from 'mongoose';

const transactionStatsSchema = new mongoose.Schema({
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    chain: { type: String, required: true },
    kind: { type: String, required: true },
});

export interface ITransactionStats {
    date: string;
    amount: number;
    chain: string;
    kind: string;
}

export interface ITransactionStatsDocument extends ITransactionStats, mongoose.Document { }

interface ITransactionStatsModelSchema extends mongoose.Model<ITransactionStatsDocument> {
    build(scriptStats: ITransactionStats): ITransactionStatsDocument;
}

transactionStatsSchema.statics.build = (transactionStats: ITransactionStats) => new TransactionStats(transactionStats);
export const TransactionStats = mongoose.model<ITransactionStatsDocument, ITransactionStatsModelSchema>('TransactionStats', transactionStatsSchema);
