import { BigNumber } from 'ethers';
import { IMaxRepetitionsCondition } from '@daemons-fi/shared-definitions';
import { IRepetitionsConditionForm } from '../../components/new-script-page/blocks/conditions/conditions-interfaces';
import { ICurrentScript } from "../i-current-script";
import { ConditionTitles } from "../../data/chains-data/interfaces";


export class RepetitionsConditionFactory {

    /** A disabled repetitions condition */
    public static empty = (): IMaxRepetitionsCondition => ({
        enabled: false,
        amount: BigNumber.from(0),
    });

    /** A repetitions condition built from json (rebuilding serialized objects) */
    public static fromJson = (repetitionsJson?: any): IMaxRepetitionsCondition => (
        repetitionsJson
            ? {
                enabled: repetitionsJson.enabled,
                amount: BigNumber.from(repetitionsJson.amount),
            }
            : this.empty());

    /** A repetitions condition built from user inputs */
    public static fromForm = (form: IRepetitionsConditionForm): IMaxRepetitionsCondition => {
        if (!form.valid) throw new Error('Cannot build Repetitions condition from invalid form');

        return {
            enabled: true,
            amount: BigNumber.from(Math.min(form.amount, 4294967295)) // truncate to uint32
        };
    };

    /** A repetitions condition built from a bundle generated in the new-script-page */
    public static fromBundle = (bundle: ICurrentScript): IMaxRepetitionsCondition => {
        const condition = bundle.conditions[ConditionTitles.REPETITIONS];
        if (!condition) return this.empty();

        const form = condition.form as any as IRepetitionsConditionForm;
        return this.fromForm(form);
    };
}
