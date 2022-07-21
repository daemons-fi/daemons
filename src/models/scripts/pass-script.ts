import mongoose from 'mongoose';
import { ISignedPassAction } from '@daemons-fi/shared-definitions';
import { utils } from 'ethers';
import { balanceCondition, followCondition, frequencyCondition, healthFactorCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber } from '../utils';
import { Script } from "./script";


const passScriptSchema = new mongoose.Schema({
    // fields handled by parent 'Script'
    // scriptId
    // user
    // chainId
    // description

    // extra fields
    signature: { type: String, required: true },

    // message signed by the user
    //scriptId: { type: String, required: true, unique:true, index: { unique: true } },
    tip: { type: String, required: true, set: stringifyBigNumber },
    executor: { type: String, required: true, set: utils.getAddress },
    balance: { type: balanceCondition, set: removeIfEmpty },
    frequency: { type: frequencyCondition, set: removeIfEmpty },
    price: { type: priceCondition, set: removeIfEmpty },
    repetitions: { type: repetitionsCondition, set: removeIfEmpty },
    follow: { type: followCondition, set: removeIfEmpty },
    healthFactor: { type: healthFactorCondition, set: removeIfEmpty },
});

interface IPassScriptDocument extends ISignedPassAction, mongoose.Document { }

interface IPassScriptModelSchema extends mongoose.Model<any> {
    build(signedScript: ISignedPassAction): IPassScriptDocument;
}

passScriptSchema.statics.build = (signedScript: ISignedPassAction) => new PassScript(signedScript);
export const PassScript = Script.discriminator<IPassScriptDocument, IPassScriptModelSchema>('PassScript', passScriptSchema);
