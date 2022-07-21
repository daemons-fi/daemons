import { utils } from 'ethers';
import mongoose from 'mongoose';
import { ISignedMMBaseAction } from '@daemons-fi/shared-definitions';
import { balanceCondition, followCondition, frequencyCondition, healthFactorCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber } from '../utils';
import { Script } from "./script";


const mmBaseScriptSchema = new mongoose.Schema({
    // fields handled by parent 'Script'
    // scriptId
    // user
    // chainId
    // description

    // extra fields
    signature: { type: String, required: true },

    // message signed by the user
    token: { type: String, required: true, set: utils.getAddress },
    aToken: { type: String, required: true, set: utils.getAddress },
    action: { type: Number, required: true },
    typeAmt: { type: Number, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
    tip: { type: String, required: true, set: stringifyBigNumber },
    kontract: { type: String, required: true, set: utils.getAddress },
    executor: { type: String, required: true, set: utils.getAddress },
    balance: { type: balanceCondition, set: removeIfEmpty },
    frequency: { type: frequencyCondition, set: removeIfEmpty },
    price: { type: priceCondition, set: removeIfEmpty },
    repetitions: { type: repetitionsCondition, set: removeIfEmpty },
    follow: { type: followCondition, set: removeIfEmpty },
    healthFactor: { type: healthFactorCondition, set: removeIfEmpty },
});

interface IMmBaseScriptDocument extends ISignedMMBaseAction, mongoose.Document { }

interface IMmBaseScriptModelSchema extends mongoose.Model<IMmBaseScriptDocument> {
    build(signedScript: ISignedMMBaseAction): IMmBaseScriptDocument;
}

mmBaseScriptSchema.statics.build = (signedScript: ISignedMMBaseAction) => new MmBaseScript(signedScript);
export const MmBaseScript = Script.discriminator<IMmBaseScriptDocument, IMmBaseScriptModelSchema>('MmBaseScript', mmBaseScriptSchema);
