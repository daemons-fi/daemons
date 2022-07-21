import mongoose from 'mongoose';

const scriptStatsSchema = new mongoose.Schema({
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    chain: { type: String, required: true },
    kind: { type: String, required: true },
});

export interface IScriptStats {
    date: string;
    amount: number;
    chain: string;
    kind: string;
}

export interface IScriptStatsDocument extends IScriptStats, mongoose.Document { }

interface IScriptStatsModelSchema extends mongoose.Model<IScriptStatsDocument> {
    build(scriptStats: IScriptStats): IScriptStatsDocument;
}

scriptStatsSchema.statics.build = (scriptStats: IScriptStats) => new ScriptStats(scriptStats);
export const ScriptStats = mongoose.model<IScriptStatsDocument, IScriptStatsModelSchema>('ScriptStats', scriptStatsSchema);
