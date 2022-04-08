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

export const ConditionBlock = ({
  condition,
  onRemove
}: {
  condition: ICondition;
  onRemove: () => void;
}) => {
  const conditionForm = condition.toConditionForm();

  const getContent = (conditionForm: IScriptConditionForm) => {
    switch (conditionForm.type) {
      case ScriptConditions.FREQUENCY:
        return (
          <FrequencyCondition
            form={conditionForm as IFrequencyConditionForm}
            update={(form) => {}}
          />
        );

      case ScriptConditions.BALANCE:
        return (
          <BalanceCondition form={conditionForm as IBalanceConditionForm} update={(form) => {}} />
        );

      case ScriptConditions.PRICE:
        return <PriceCondition form={conditionForm as IPriceConditionForm} update={(form) => {}} />;

      case ScriptConditions.REPETITIONS:
        return (
          <RepetitionsCondition
            form={conditionForm as IRepetitionsConditionForm}
            update={(form) => {}}
          />
        );

      case ScriptConditions.FOLLOW:
        return (
          <FollowCondition form={conditionForm as IFollowConditionForm} update={(form) => {}} />
        );
    }
  };

  return (
    <div key={condition.title} className="script-block">
      <div className="script-block__button-remove" onClick={onRemove}>
        x
      </div>
      <label className="script-block__title">{condition.title}</label>
      {getContent(conditionForm)}
    </div>
  );
};
