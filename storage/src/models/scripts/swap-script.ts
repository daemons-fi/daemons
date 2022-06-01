import { utils } from 'ethers';
import mongoose from 'mongoose';
import { ISignedSwapAction } from '@daemons-fi/shared-definitions';
import { balanceCondition, followCondition, frequencyCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber } from '../utils';
import { Script } from "./script";


const swapScriptSchema = new mongoose.Schema({
    // fields handled by parent 'Script'
    // scriptId
    // user
    // chainId
    // description

    // extra fields
    signature: { type: String, required: true },

    // message signed by the user
    tokenFrom: { type: String, required: true },
    tokenTo: { type: String, required: true },
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
});

interface ISwapScriptDocument extends ISignedSwapAction, mongoose.Document { }

interface ISwapScriptModelSchema extends mongoose.Model<ISwapScriptDocument> {
    build(signedScript: ISignedSwapAction): ISwapScriptDocument;
}

swapScriptSchema.statics.build = (signedScript: ISignedSwapAction) => new SwapScript(signedScript);
export const SwapScript = Script.discriminator<ISwapScriptDocument, ISwapScriptModelSchema>('SwapScript', swapScriptSchema);
