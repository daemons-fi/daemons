import {
    AdvancedMoneyMarketActionType,
    AmountType,
    BaseMoneyMarketActionType,
    InterestRateMode,
    ZapOutputChoice
} from "@daemons-fi/shared-definitions/build";
import {
    IAdvancedMMActionForm,
    IBaseMMActionForm,
    ISwapActionForm,
    ITransferActionForm,
    IZapInActionForm,
    IZapOutActionForm,
    ScriptAction
} from "../action-form-interfaces";
import { IAction } from "../interfaces";
import {
    AaveHealthFactorCondition,
    BalanceCondition,
    FrequencyCondition,
    PriceCondition,
    RepetitionsCondition
} from "./condition-forms";
import { kovanAaveMM, kovanSushiDEX } from "./tokens";

export const TransferAction: IAction = {
    title: "Transfer",
    info: "Transfer some tokens from your wallet to another address.",

    form: {
        type: ScriptAction.TRANSFER,
        valid: false,
        tokenAddress: "",
        destinationAddress: "",
        amountType: AmountType.Absolute,
        floatAmount: 0,
        floatTip: 0
    } as ITransferActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};

export const SwapAction: IAction = {
    title: "Swap on Sushi",
    info: "Swap one token for another using the Sushi DEX.",

    form: {
        type: ScriptAction.SWAP,
        valid: false,
        tokenFromAddress: "",
        tokenToAddress: "",
        amountType: AmountType.Absolute,
        floatAmount: 0,
        floatTip: 0,
        dex: kovanSushiDEX
    } as ISwapActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};

export const AaveMMBaseAction: IAction = {
    title: "AAVE Deposit/Withdraw",
    info: "Deposit and withdraw tokens into Aave.",

    form: {
        type: ScriptAction.MM_BASE,
        valid: false,
        tokenAddress: "",
        amountType: AmountType.Absolute,
        floatAmount: 0,
        floatTip: 0,
        actionType: BaseMoneyMarketActionType.Deposit,
        moneyMarket: kovanAaveMM
    } as IBaseMMActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
        AaveHealthFactorCondition
    ]
};

export const AaveMMAdvancedAction: IAction = {
    title: "AAVE Borrow/Repay",
    info: "Borrow and repay from Aave.",

    form: {
        type: ScriptAction.MM_ADV,
        valid: false,
        tokenAddress: "",
        interestType: InterestRateMode.Variable,
        amountType: AmountType.Absolute,
        floatAmount: 0,
        floatTip: 0,
        actionType: AdvancedMoneyMarketActionType.Borrow,
        moneyMarket: kovanAaveMM
    } as IAdvancedMMActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
        AaveHealthFactorCondition
    ]
};

export const ZapInAction: IAction = {
    title: "Zap In",
    info: "Creates an LP",

    form: {
        type: ScriptAction.ZAP_IN,
        valid: false,
        tokenA: "",
        tokenB: "",
        amountTypeA: AmountType.Absolute,
        amountTypeB: AmountType.Absolute,
        floatAmountA: 0,
        floatAmountB: 0,
        floatTip: 0,
        dex: kovanSushiDEX
    } as IZapInActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};

export const ZapOutAction: IAction = {
    title: "Zap Out",
    info: "Breaks an LP into it's basic components",

    form: {
        type: ScriptAction.ZAP_OUT,
        valid: true,
        tokenA: "",
        tokenB: "",
        amountType: AmountType.Percentage,
        floatAmount: 50,
        floatTip: 0,
        outputChoice: ZapOutputChoice.bothTokens,
        dex: kovanSushiDEX
    } as IZapOutActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};
