import { IScriptActionForm } from '../../data/chains-data/action-form-interfaces';
import { IBalanceConditionForm, IFollowConditionForm, IFrequencyConditionForm, IPriceConditionForm, IRepetitionsConditionForm } from './blocks/conditions/conditions-interfaces';

export interface INewScriptForm {
    valid: boolean;
}

export interface INewScriptBundle {
    frequencyCondition: IFrequencyConditionForm;
    balanceCondition: IBalanceConditionForm;
    priceCondition: IPriceConditionForm;
    repetitionsCondition: IRepetitionsConditionForm;
    followCondition: IFollowConditionForm;
    actionForm: IScriptActionForm;
}
