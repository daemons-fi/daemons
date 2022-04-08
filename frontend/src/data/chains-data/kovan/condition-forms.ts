import { ComparisonType } from "@daemons-fi/shared-definitions/build";
import { FrequencyUnits } from "../condition-form-interfaces";
import { IBalanceConditionForm } from "../condition-form-interfaces";
import { IFollowConditionForm } from "../condition-form-interfaces";
import { IFrequencyConditionForm } from "../condition-form-interfaces";
import { IPriceConditionForm } from "../condition-form-interfaces";
import { IRepetitionsConditionForm } from "../condition-form-interfaces";
import { ScriptConditions } from "../condition-form-interfaces";
import { ICondition } from "../interfaces";

export const FrequencyCondition: ICondition = {
    title: "Frequency",
    description: "Execute the scripts with a certain frequency, like every 1 hour or 15 minutes.",

    form: {
        type: ScriptConditions.FREQUENCY,
        valid: true,
        enabled: false,
        ticks: 1,
        unit: FrequencyUnits.Hours,
        startNow: true
    } as IFrequencyConditionForm
};

export const BalanceCondition: ICondition = {
    title: "Balance",
    description:
        "Execute the scripts only when you own a certain quantity of a token in your wallet.",

    form: {
        type: ScriptConditions.BALANCE,
        valid: false,
        enabled: false,
        comparison: ComparisonType.GreaterThan,
        floatAmount: 0
    } as IBalanceConditionForm
};

export const PriceCondition: ICondition = {
    title: "Price",
    description: "Execute the scripts only when the price of a token passes a threshold.",

    form: {
        type: ScriptConditions.PRICE,
        valid: false,
        enabled: false,
        comparison: ComparisonType.GreaterThan,
        floatValue: 0
    } as IPriceConditionForm
};

export const RepetitionsCondition: ICondition = {
    title: "Repetitions",
    description: "Set a maximum number of times a script should be run.",

    form: {
        type: ScriptConditions.REPETITIONS,
        valid: false,
        enabled: false,
        amount: 0
    } as IRepetitionsConditionForm
};

export const FollowCondition: ICondition = {
    title: "Chain Scripts",
    description: "Execute this script only after another one is executed",

    form: {
        type: ScriptConditions.FOLLOW,
        valid: false,
        enabled: false
    } as IFollowConditionForm
};
