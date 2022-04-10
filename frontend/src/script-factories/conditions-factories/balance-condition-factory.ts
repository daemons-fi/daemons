import { BigNumber, utils } from "ethers";
import { IBalanceCondition } from "@daemons-fi/shared-definitions";
import { IBalanceConditionForm } from "../../components/new-script-page/blocks/conditions/conditions-interfaces";
import { ZeroAddress } from "../../data/chain-info";
import { ConditionTitles, Token } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";

export class BalanceConditionFactory {
    /** A disabled balance condition */
    public static empty = (): IBalanceCondition => ({
        enabled: false,
        amount: BigNumber.from(0),
        comparison: 0,
        token: ZeroAddress
    });

    /** A balance condition built from json (rebuilding serialized objects) */
    public static fromJson = (balanceJson?: any): IBalanceCondition =>
        balanceJson
            ? {
                  enabled: balanceJson.enabled,
                  amount: BigNumber.from(balanceJson.amount),
                  comparison: balanceJson.comparison,
                  token: balanceJson.token
              }
            : this.empty();

    /** A balance condition built from user inputs */
    public static fromForm = (form: IBalanceConditionForm, tokens: Token[]): IBalanceCondition => {
        if (!form.valid) throw new Error("Cannot build Balance condition from invalid form");

        const token = tokens.filter((token) => token.address === form.tokenAddress)[0];
        const amount = utils.parseUnits(form.floatAmount.toString(), token.decimals);

        return {
            enabled: true,
            amount: amount,
            comparison: form.comparison,
            token: token.address
        };
    };

    /** A balance condition built from a bundle generated in the new-script-page */
    public static fromBundle = (bundle: ICurrentScript, tokens: Token[]): IBalanceCondition => {
        const condition = bundle.conditions[ConditionTitles.BALANCE];
        if (!condition) return this.empty();

        const form = condition.form as any as IBalanceConditionForm;
        return this.fromForm(form, tokens);
    };
}
