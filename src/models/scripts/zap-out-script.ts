import mongoose from 'mongoose';
import { ISignedZapOutAction } from '@daemons-fi/shared-definitions';
import { utils } from 'ethers';
import { balanceCondition, followCondition, frequencyCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber } from '../utils';
import { Script } from "./script";


const zapOutScriptSchema = new mongoose.Schema({
    // fields handled by parent 'Script'
    // scriptId
    // user
    // chainId
    // description

    // extra fields
    signature: { type: String, required: true },

    // message signed by the user
    //scriptId: { type: String, required: true, unique:true, index: { unique: true } },
    tokenA: { type: String, required: true, set: utils.getAddress },
    tokenB: { type: String, required: true, set: utils.getAddress },
    amount: { type: String, required: true, set: stringifyBigNumber },
    typeAmt: { type: Number, required: true },
    outputChoice: { type: Number, required: true },
    tip: { type: String, required: true, set: stringifyBigNumber },
    kontract: { type: String, required: true, set: utils.getAddress },
    executor: { type: String, required: true, set: utils.getAddress },
    balance: { type: balanceCondition, set: removeIfEmpty },
    frequency: { type: frequencyCondition, set: removeIfEmpty },
    price: { type: priceCondition, set: removeIfEmpty },
    repetitions: { type: repetitionsCondition, set: removeIfEmpty },
    follow: { type: followCondition, set: removeIfEmpty },
});

interface IZapOutScriptDocument extends ISignedZapOutAction, mongoose.Document { }

interface IZapOutScriptModelSchema extends mongoose.Model<any> {
    build(signedScript: ISignedZapOutAction): IZapOutScriptDocument;
}

zapOutScriptSchema.statics.build = (signedScript: ISignedZapOutAction) => new ZapOutScript(signedScript);
export const ZapOutScript = Script.discriminator<IZapOutScriptDocument, IZapOutScriptModelSchema>('ZapOutScript', zapOutScriptSchema);
