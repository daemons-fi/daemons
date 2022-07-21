import { utils } from "ethers";
import mongoose from 'mongoose';
import mongooseUniqueValidator from "mongoose-unique-validator";
import { stringifyBigNumber, truncateAndEscapeText } from "../utils";

/**
 * Schema representing a script object,
 * containing the properties shared across all scripts.
 */
const scriptSchema = new mongoose.Schema({
    scriptId: { type: String, required: true, unique:true, index: { unique: true } },
    chainId: { type: String, required: true, index: true, set: stringifyBigNumber },
    user: { type: String, required: true, index: true, set: utils.getAddress },
    description: { type: String, required: true, maxlength: 150, set: truncateAndEscapeText },
}, {
    discriminatorKey: '__type',
    collection: 'scripts'
});
mongooseUniqueValidator(scriptSchema);

export const Script = mongoose.model('Script', scriptSchema, 'scripts');
