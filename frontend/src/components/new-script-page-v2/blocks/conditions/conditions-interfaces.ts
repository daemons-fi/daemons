import { ComparisonType } from '@daemons-fi/shared-definitions';
import { INewScriptForm } from '../../i-new-script-form';

export interface IScriptConditionForm extends INewScriptForm {
    enabled: boolean;
}

export enum FrequencyUnits { Seconds = 1, Minutes = 60, Hours = 3600, Days = 86400, Weeks = 604800 };

export interface IFrequencyConditionForm extends IScriptConditionForm {
    ticks: number;
    unit: FrequencyUnits;
    startNow: boolean;
}

export interface IBalanceConditionForm extends IScriptConditionForm {
    tokenAddress?: string;
    comparison: ComparisonType;
    floatAmount: number;
}

export interface IPriceConditionForm extends IScriptConditionForm {
    tokenAddress?: string;
    comparison: ComparisonType;
    floatValue: number;
}

export interface IRepetitionsConditionForm extends IScriptConditionForm {
    amount: number;
}

export interface IFollowConditionForm extends IScriptConditionForm {
    parentScriptId?: string;
    parentScriptExecutor?: string;
}
