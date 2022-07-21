import mongoose from 'mongoose';

const userStatsSchema = new mongoose.Schema({
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    chain: { type: String, required: true },
});

export interface IUserStats {
    date: string;
    amount: number;
    chain: string;
}

export interface IUserStatsDocument extends IUserStats, mongoose.Document { }

interface IUserStatsModelSchema extends mongoose.Model<IUserStatsDocument> {
    build(userStats: IUserStats): IUserStatsDocument;
}

userStatsSchema.statics.build = (userStats: IUserStats) => new UserStats(userStats);
export const UserStats = mongoose.model<IUserStatsDocument, IUserStatsModelSchema>('UserStats', userStatsSchema);
