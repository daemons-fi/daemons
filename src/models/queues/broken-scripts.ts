import { utils } from "ethers";
import mongoose from "mongoose";
import { IQueuedScript } from "./i-queued-script";

const brokenScriptSchema = new mongoose.Schema({
    scriptId: { type: String, required: true, unique: true, index: { unique: true } },
    reporter: { type: String, required: true, index: true, set: utils.getAddress }
});

interface IBrokenScriptDocument extends IQueuedScript, mongoose.Document {}

interface IBrokenScriptModelSchema extends mongoose.Model<IBrokenScriptDocument> {
    build(brokenScript: IQueuedScript): IBrokenScriptDocument;
}

brokenScriptSchema.statics.build = (brokenScript: IQueuedScript) => new BrokenScript(brokenScript);
export const BrokenScript = mongoose.model<IBrokenScriptDocument, IBrokenScriptModelSchema>(
    "BrokenScript",
    brokenScriptSchema
);
