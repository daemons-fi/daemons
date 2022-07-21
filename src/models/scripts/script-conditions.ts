import { utils } from 'ethers';
import mongoose from 'mongoose';
import { stringifyBigNumber } from '../utils';


export const balanceCondition = new mongoose.Schema({
    enabled: { type: Boolean, required: true },
    token: { type: String, required: true },
    comparison: { type: Number, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
});

export const frequencyCondition = new mongoose.Schema({
    enabled: { type: Boolean, required: true },
    delay: { type: String, required: true, set: stringifyBigNumber },
    start: { type: String, required: true, set: stringifyBigNumber },
});

export const priceCondition = new mongoose.Schema({
    enabled: { type: Boolean, required: true },
    tokenA: { type: String, required: true, set: utils.getAddress },
    tokenB: { type: String, required: true, set: utils.getAddress },
    comparison: { type: Number, required: true },
    value: { type: String, required: true, set: stringifyBigNumber },
    router: { type: String, required: true, set: utils.getAddress },
});

export const repetitionsCondition = new mongoose.Schema({
    enabled: { type: Boolean, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
});

export const followCondition = new mongoose.Schema({
    enabled: { type: Boolean, required: true },
    scriptId: { type: String, required: true, set: stringifyBigNumber },
    executor: { type: String, required: true, set: utils.getAddress },
    shift: { type: String, required: true, set: stringifyBigNumber },
});

export const healthFactorCondition = new mongoose.Schema({
    enabled: { type: Boolean, required: true },
    kontract: { type: String, required: true },
    comparison: { type: Number, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
});
