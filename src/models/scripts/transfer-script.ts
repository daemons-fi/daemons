import mongoose from 'mongoose';
import { ISignedTransferAction } from '@daemons-fi/shared-definitions';
import { utils } from 'ethers';
import { balanceCondition, followCondition, frequencyCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber } from '../utils';
import { Script } from "./script";


const transferScriptSchema = new mongoose.Schema({
    // fields handled by parent 'Script'
    // scriptId
    // user
    // chainId
    // description

    // extra fields
    signature: { type: String, required: true },

    // message signed by the user
    //scriptId: { type: String, required: true, unique:true, index: { unique: true } },
    token: { type: String, required: true },
    destination: { type: String, required: true },
    typeAmt: { type: Number, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
    tip: { type: String, required: true, set: stringifyBigNumber },
    executor: { type: String, required: true, set: utils.getAddress },
    balance: { type: balanceCondition, set: removeIfEmpty },
    frequency: { type: frequencyCondition, set: removeIfEmpty },
    price: { type: priceCondition, set: removeIfEmpty },
    repetitions: { type: repetitionsCondition, set: removeIfEmpty },
    follow: { type: followCondition, set: removeIfEmpty },
});

interface ITransferScriptDocument extends ISignedTransferAction, mongoose.Document { }

interface ITransferScriptModelSchema extends mongoose.Model<any> {
    build(signedScript: ISignedTransferAction): ITransferScriptDocument;
}

transferScriptSchema.statics.build = (signedScript: ISignedTransferAction) => new TransferScript(signedScript);
export const TransferScript = Script.discriminator<ITransferScriptDocument, ITransferScriptModelSchema>('TransferScript', transferScriptSchema);
