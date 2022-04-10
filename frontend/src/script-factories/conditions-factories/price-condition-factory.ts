import { BigNumber, utils } from "ethers";
import { IPriceCondition } from "@daemons-fi/shared-definitions";
import { IPriceConditionForm } from "../../components/new-script-page/blocks/conditions/conditions-interfaces";
import { ZeroAddress } from "../../data/chain-info";
import { ConditionTitles, Token } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";

export class PriceConditionFactory {
    /** A disabled price condition */
    public static empty = (): IPriceCondition => ({
        enabled: false,
        value: BigNumber.from(0),
        comparison: 0,
        token: ZeroAddress
    });

    /** A price condition built from json (rebuilding serialized objects) */
    public static fromJson = (priceJson?: any): IPriceCondition =>
        priceJson
            ? {
                  enabled: priceJson.enabled,
                  value: BigNumber.from(priceJson.value),
                  comparison: priceJson.comparison,
                  token: priceJson.token
              }
            : this.empty();

    /** A price condition built from user inputs */
    public static fromForm = (form: IPriceConditionForm, tokens: Token[]): IPriceCondition => {
        if (!form.valid) throw new Error("Cannot build Price condition from invalid form");

        const token = tokens.filter((token) => token.address === form.tokenAddress)[0];
        const value = utils.parseUnits(form.floatValue.toString(), token.decimals);

        return {
            enabled: true,
            value: value,
            comparison: form.comparison,
            token: token.address
        };
    };

    /** A price condition built from a bundle generated in the new-script-page */
    public static fromBundle = (bundle: ICurrentScript, tokens: Token[]): IPriceCondition => {
        const condition = bundle.conditions[ConditionTitles.PRICE];
        if (!condition) return this.empty();

        const form = condition.form as any as IPriceConditionForm;
        return this.fromForm(form, tokens);
    };
}
