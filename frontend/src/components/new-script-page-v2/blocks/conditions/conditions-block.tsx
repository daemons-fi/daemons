import React from "react";
import { IBalanceConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { IFrequencyConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { IScriptConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { ScriptConditions } from "../../../../data/chains-data/condition-form-interfaces";
import { IPriceConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { IFollowConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { IRepetitionsConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { ICondition } from "../../../../data/chains-data/interfaces";
import { BalanceCondition } from "./balance-condition";
import { FollowCondition } from "./follow-condition";
import { FrequencyCondition } from "./frequency-condition";
import { PriceCondition } from "./price-condition";
import { RepetitionsCondition } from "./repetitions-condition";

interface IConditionBlockProps {
    condition: ICondition;
    onUpdate: (conditionTitle: string, newForm: IScriptConditionForm) => void;
    onRemove: (conditionTitle: string) => void;
}

export const ConditionBlock = ({ condition, onUpdate, onRemove }: IConditionBlockProps) => {
    const getContent = (conditionForm: IScriptConditionForm) => {
        switch (conditionForm.type) {
            case ScriptConditions.FREQUENCY:
                return (
                    <FrequencyCondition
                        form={conditionForm as IFrequencyConditionForm}
                        update={(form) => {onUpdate(condition.title, form)}}
                    />
                );

            case ScriptConditions.BALANCE:
                return (
                    <BalanceCondition
                        form={conditionForm as IBalanceConditionForm}
                        update={(form) => {onUpdate(condition.title, form)}}
                    />
                );

            case ScriptConditions.PRICE:
                return (
                    <PriceCondition
                        form={conditionForm as IPriceConditionForm}
                        update={(form) => {onUpdate(condition.title, form)}}
                    />
                );

            case ScriptConditions.REPETITIONS:
                return (
                    <RepetitionsCondition
                        form={conditionForm as IRepetitionsConditionForm}
                        update={(form) => {onUpdate(condition.title, form)}}
                    />
                );

            case ScriptConditions.FOLLOW:
                return (
                    <FollowCondition
                        form={conditionForm as IFollowConditionForm}
                        update={(form) => {onUpdate(condition.title, form)}}
                    />
                );
        }
    };

    return (
        <div key={condition.title} className="script-block">
            <div className="script-block__button-remove" onClick={() => onRemove(condition.title)}>
                x
            </div>
            <label className="script-block__title">{condition.title}</label>
            {getContent(condition.form)}
        </div>
    );
};
