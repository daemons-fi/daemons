import { BigNumber, Contract } from "ethers";
import { IFollowCondition } from "@daemons-fi/shared-definitions";
import { IFollowConditionForm } from "../../components/new-script-page/blocks/conditions/conditions-interfaces";
import { getAbiFor } from "../../utils/get-abi";
import { ZeroAddress, ZeroId } from "../../data/chain-info";
import { ICurrentScript } from "../i-current-script";
import { ConditionTitles } from "../../data/chains-data/interfaces";

export class FollowConditionFactory {
    /** A disabled frequency condition */
    public static empty = (): IFollowCondition => ({
        enabled: false,
        scriptId: ZeroId,
        executor: ZeroAddress,
        shift: BigNumber.from(0)
    });

    /** A frequency condition built from json (rebuilding serialized objects) */
    public static fromJson = (followJson?: any): IFollowCondition =>
        followJson
            ? {
                  enabled: followJson.enabled,
                  scriptId: followJson.scriptId,
                  executor: followJson.executor,
                  shift: BigNumber.from(followJson.shift)
              }
            : this.empty();

    /** A frequency condition built from user inputs */
    public static fromForm = async (form: IFollowConditionForm): Promise<IFollowCondition> => {
        if (!form.parentScriptId || !form.parentScriptExecutor) {
            return this.empty();
        }
        if (!form.valid) throw new Error("Cannot build Follow condition from invalid form");

        // calculate shift (difference between the number of executions of the parent and the child)
        const executorContract = await this.getExecutor(form.parentScriptExecutor);
        const shift = await executorContract.getRepetitions(form.parentScriptId);

        return {
            enabled: form.enabled,
            scriptId: form.parentScriptId,
            executor: form.parentScriptExecutor,
            shift: shift
        };
    };

    private static async getExecutor(executorAddress: string): Promise<Contract> {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAbi = await getAbiFor("ConditionsChecker");
        return new ethers.Contract(executorAddress, contractAbi, signer);
    }

    /** A follow condition built from a bundle generated in the new-script-page */
    public static fromBundle = async (bundle: ICurrentScript): Promise<IFollowCondition> => {
        const condition = bundle.conditions[ConditionTitles.FOLLOW];
        if (!condition) return this.empty();

        const form = condition.form as any as IFollowConditionForm;
        return this.fromForm(form);
    };
}
