import mongoose from 'mongoose';
import { ISignedZapInAction } from '@daemons-fi/shared-definitions';
import { utils } from 'ethers';
import { balanceCondition, followCondition, frequencyCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber } from '../utils';
import { Script } from "./script";


const zapInScriptSchema = new mongoose.Schema({
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
    amountA: { type: String, required: true, set: stringifyBigNumber },
    amountB: { type: String, required: true, set: stringifyBigNumber },
    typeAmtA: { type: Number, required: true },
    typeAmtB: { type: Number, required: true },
    tip: { type: String, required: true, set: stringifyBigNumber },
    kontract: { type: String, required: true, set: utils.getAddress },
    executor: { type: String, required: true, set: utils.getAddress },
    balance: { type: balanceCondition, set: removeIfEmpty },
    frequency: { type: frequencyCondition, set: removeIfEmpty },
    price: { type: priceCondition, set: removeIfEmpty },
    repetitions: { type: repetitionsCondition, set: removeIfEmpty },
    follow: { type: followCondition, set: removeIfEmpty },
});

interface IZapInScriptDocument extends ISignedZapInAction, mongoose.Document { }

interface IZapInScriptModelSchema extends mongoose.Model<any> {
    build(signedScript: ISignedZapInAction): IZapInScriptDocument;
}

zapInScriptSchema.statics.build = (signedScript: ISignedZapInAction) => new ZapInScript(signedScript);
export const ZapInScript = Script.discriminator<IZapInScriptDocument, IZapInScriptModelSchema>('ZapInScript', zapInScriptSchema);
