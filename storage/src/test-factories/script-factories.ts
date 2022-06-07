import { BigNumber, utils } from "ethers";
import {
    AmountType,
    ComparisonType,
    IBalanceCondition,
    IFollowCondition,
    IFrequencyCondition,
    IHealthFactorCondition,
    IMaxRepetitionsCondition,
    InterestRateMode,
    IPriceCondition,
    ISignedMMAdvancedAction,
    ISignedZapInAction,
    ISignedZapOutAction,
    ZapOutputChoice
} from "@daemons-fi/shared-definitions";
import { ISignedSwapAction } from "@daemons-fi/shared-definitions";
import { ISignedTransferAction } from "@daemons-fi/shared-definitions";
import { SwapScript } from "../models/scripts/swap-script";
import { TransferScript } from "../models/scripts/transfer-script";
import faker from "@faker-js/faker";
import { BaseMoneyMarketActionType, ISignedMMBaseAction } from "@daemons-fi/shared-definitions";
import { MmBaseScript } from "../models/scripts/mm-base-script";
import { MmAdvancedScript } from "../models/scripts/mm-adv-script";
import { ZapInScript } from "../models/scripts/zap-in-script";
import { ZapOutScript } from "../models/scripts/zap-out-script";

const randomEthAmount = () =>
    utils.parseEther(faker.datatype.number({ min: 0.01, max: 10, precision: 0.01 }).toString());
const randomBigNumber = () =>
    BigNumber.from(faker.datatype.number({ min: 0, max: 10000 }).toString());

/** Returns a randomized balance condition */
function balanceConditionFactory(args: any): IBalanceCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? ComparisonType.GreaterThan,
        amount: args.amount ?? randomEthAmount(),
        token: args.token ?? "0x596e8221a30bfe6e7eff67fee664a01c73ba3c56"
    };
}

/** Returns a randomized price condition */
function priceConditionFactory(args: any): IPriceCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? ComparisonType.GreaterThan,
        value: args.value ?? randomEthAmount(),
        token: args.token ?? faker.finance.ethereumAddress()
    };
}

/** Returns a randomized frequency condition */
function frequencyConditionFactory(args: any): IFrequencyCondition {
    return {
        enabled: args.enabled ?? false,
        delay: args.blocks ?? randomBigNumber(),
        start: args.startBlock ?? randomBigNumber()
    };
}

/** Returns a randomized frequency condition */
function repetitionsConditionFactory(args: any): IMaxRepetitionsCondition {
    return {
        enabled: args.enabled ?? false,
        amount: args.amount ?? randomBigNumber()
    };
}

/** Returns a randomized frequency condition */
function followConditionFactory(args: any): IFollowCondition {
    return {
        enabled: args.enabled ?? false,
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        shift: args.amount ?? randomBigNumber()
    };
}

/** Returns a randomized HealthFactor condition */
function healthFactorConditionFactory(args: any): IHealthFactorCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? ComparisonType.GreaterThan,
        amount: args.amount ?? randomEthAmount(),
        kontract: args.kontract ?? "0x596e8221a30bfe6e7eff67fee664a01c73ba3c56"
    };
}

/** Returns a randomized signed swap action */
export function signedSwapActionFactory(args: any): ISignedSwapAction & { __type: string } {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(65)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        tokenFrom: args.tokenFrom ?? faker.finance.ethereumAddress(),
        tokenTo: args.tokenTo ?? faker.finance.ethereumAddress(),
        typeAmt: args.typeAmt ?? AmountType.Absolute,
        amount: args.amount ?? randomEthAmount(),
        tip: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        kontract: args.kontract ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {}),
        __type: "SwapScript"
    };
}

/** Adds a SwapScript to mongo and returns it */
export async function swapScriptDocumentFactory(args: any): Promise<ISignedSwapAction> {
    const signedScript = signedSwapActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await SwapScript.build(jsonTransformedScript).save();
}

/** Returns a randomized signed transfer action */
export function signedTransferActionFactory(args: any): ISignedTransferAction & { __type: string } {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(65)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        token: args.token ?? faker.finance.ethereumAddress(),
        destination: args.destination ?? faker.finance.ethereumAddress(),
        typeAmt: args.typeAmt ?? AmountType.Absolute,
        amount: args.amount ?? randomEthAmount(),
        tip: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {}),
        __type: "TransferScript"
    };
}

/** Adds a TransferScript to mongo and returns it */
export async function transferScriptDocumentFactory(args: any): Promise<ISignedTransferAction> {
    const signedScript = signedTransferActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await TransferScript.build(jsonTransformedScript).save();
}

/** Returns a randomized signed mmBase action */
export function signedMmBaseActionFactory(args: any): ISignedMMBaseAction & { __type: string } {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(65)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        token: args.token ?? faker.finance.ethereumAddress(),
        aToken: args.aToken ?? faker.finance.ethereumAddress(),
        action: args.typeAmt ?? BaseMoneyMarketActionType.Deposit,
        typeAmt: args.typeAmt ?? AmountType.Absolute,
        amount: args.amount ?? randomEthAmount(),
        tip: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        kontract: args.kontract ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {}),
        healthFactor: healthFactorConditionFactory(args.healthFactor ?? {}),
        __type: "MmBaseScript"
    };
}

/** Adds a MmBaseScript to mongo and returns it */
export async function mmBaseScriptDocumentFactory(args: any): Promise<ISignedMMBaseAction> {
    const signedScript = signedMmBaseActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await MmBaseScript.build(jsonTransformedScript).save();
}

/** Returns a randomized signed mmAdvanced action */
export function signedMmAdvancedActionFactory(args: any): ISignedMMAdvancedAction & { __type: string } {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(65)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        token: args.token ?? faker.finance.ethereumAddress(),
        debtToken: args.aToken ?? faker.finance.ethereumAddress(),
        action: args.action ?? BaseMoneyMarketActionType.Deposit,
        rateMode: args.rateMode ?? InterestRateMode.Variable,
        typeAmt: args.typeAmt ?? AmountType.Absolute,
        amount: args.amount ?? randomEthAmount(),
        tip: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        kontract: args.kontract ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {}),
        healthFactor: healthFactorConditionFactory(args.healthFactor ?? {}),
        __type: "MmAdvancedScript"
    };
}

/** Adds a MmAdvancedScript to mongo and returns it */
export async function mmAdvancedScriptDocumentFactory(args: any): Promise<ISignedMMAdvancedAction> {
    const signedScript = signedMmAdvancedActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await MmAdvancedScript.build(jsonTransformedScript).save();
}

/** Returns a randomized signed zapIn action */
export function signedZapInActionFactory(args: any): ISignedZapInAction & { __type: string } {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(65)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        tokenA: args.tokenA ?? faker.finance.ethereumAddress(),
        tokenB: args.tokenB ?? faker.finance.ethereumAddress(),
        amountA: args.amountA ?? randomEthAmount(),
        amountB: args.amountB ?? randomEthAmount(),
        typeAmtA: args.typeAmtA ?? AmountType.Absolute,
        typeAmtB: args.typeAmtB ?? AmountType.Absolute,
        tip: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        kontract: args.kontract ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {}),
        __type: "ZapInScript"
    };
}

/** Adds a ZapInScript to mongo and returns it */
export async function zapInScriptDocumentFactory(args: any): Promise<ISignedZapInAction> {
    const signedScript = signedZapInActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await ZapInScript.build(jsonTransformedScript).save();
}

/** Returns a randomized signed zapOut action */
export function signedZapOutActionFactory(args: any): ISignedZapOutAction & { __type: string } {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(65)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        tokenA: args.tokenA ?? faker.finance.ethereumAddress(),
        tokenB: args.tokenB ?? faker.finance.ethereumAddress(),
        amount: args.amount ?? randomEthAmount(),
        typeAmt: args.typeAmt ?? AmountType.Absolute,
        outputChoice: args.outputChoice ?? ZapOutputChoice.bothTokens,
        tip: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        kontract: args.kontract ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {}),
        __type: "ZapOutScript"
    };
}

/** Adds a ZapOutScript to mongo and returns it */
export async function zapOutScriptDocumentFactory(args: any): Promise<ISignedZapOutAction> {
    const signedScript = signedZapOutActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await ZapOutScript.build(jsonTransformedScript).save();
}
