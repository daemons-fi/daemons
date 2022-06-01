import { utils } from "ethers";
import mongoose from "mongoose";
import { ISignedMMAdvancedAction } from "@daemons-fi/shared-definitions";
import { balanceCondition } from "./script-conditions";
import { followCondition } from "./script-conditions";
import { frequencyCondition } from "./script-conditions";
import { healthFactorCondition } from "./script-conditions";
import { priceCondition } from "./script-conditions";
import { repetitionsCondition } from "./script-conditions";
import { removeIfEmpty, stringifyBigNumber } from "../utils";
import { Script } from "./script";

const mmAdvancedScriptSchema = new mongoose.Schema({
    // fields handled by parent 'Script'
    // scriptId
    // user
    // chainId
    // description

    // extra fields
    signature: { type: String, required: true },

    // message signed by the user
    token: { type: String, required: true, set: utils.getAddress },
    debtToken: { type: String, required: true, set: utils.getAddress },
    action: { type: Number, required: true },
    typeAmt: { type: Number, required: true },
    rateMode: { type: Number, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
    tip: { type: String, required: true, set: stringifyBigNumber },
    kontract: { type: String, required: true, set: utils.getAddress },
    executor: { type: String, required: true, set: utils.getAddress },
    balance: { type: balanceCondition, set: removeIfEmpty },
    frequency: { type: frequencyCondition, set: removeIfEmpty },
    price: { type: priceCondition, set: removeIfEmpty },
    repetitions: { type: repetitionsCondition, set: removeIfEmpty },
    follow: { type: followCondition, set: removeIfEmpty },
    healthFactor: { type: healthFactorCondition, set: removeIfEmpty }
});

interface IMmAdvancedScriptDocument extends ISignedMMAdvancedAction, mongoose.Document {}

interface IMmAdvancedScriptModelSchema extends mongoose.Model<IMmAdvancedScriptDocument> {
    build(signedScript: ISignedMMAdvancedAction): IMmAdvancedScriptDocument;
}

mmAdvancedScriptSchema.statics.build = (signedScript: ISignedMMAdvancedAction) =>
    new MmAdvancedScript(signedScript);
export const MmAdvancedScript = Script.discriminator<IMmAdvancedScriptDocument, IMmAdvancedScriptModelSchema>(
    "MmAdvancedScript",
    mmAdvancedScriptSchema
);
