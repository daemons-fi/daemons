import React, { useState } from "react";
import { ScriptFactory } from "../../script-factories";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state";
import { State, TemporaryScript } from "./temporary-script";
import "./styles.css";
import { StorageProxy } from "../../data/storage-proxy";
import { addNewUSerScript } from "../../state/action-creators/script-action-creators";
import { BaseScript } from "@daemons-fi/scripts-definitions";
import { Navigate } from "react-router-dom";
import { cleanWorkbench } from "../../state/action-creators/workbench-action-creators";
import { ICurrentScript } from "../../script-factories/i-current-script";
import {
    IFollowConditionForm,
    ScriptConditions
} from "../../data/chains-data/condition-form-interfaces";
import { getExecutorFromScriptAction } from "../../script-factories/messages-factories/executor-fetcher";
import { ConditionTitles } from "../../data/chains-data/interfaces";
import { errorToast, successToast } from "../toaster";
import { ethers } from "ethers";

export function ReviewPage(): JSX.Element {
    // redux
    const dispatch = useDispatch();
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const banned: boolean = useSelector((state: RootState) => state.wallet.banned);
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);
    const workbenchScripts = useSelector((state: RootState) => state.workbench.scripts);

    // states
    const [redirect, setRedirect] = useState<boolean>(false);
    const [signStatuses, setSignStatuses] = useState<{ [id: string]: State }>({});
    const [allowStatuses, setAllowStatuses] = useState<{ [id: string]: State }>({});

    // wallet signer and provider
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    const signScript = async (
        script: ICurrentScript,
        scriptFactory: ScriptFactory
    ): Promise<BaseScript> => {
        setSignStatuses((current) => ({ ...current, [script.id]: State.loading }));
        const signedScript = await scriptFactory.SubmitScriptsForSignature(script);
        setSignStatuses((current) => ({ ...current, [script.id]: State.done }));
        return signedScript;
    };

    const requestAllowanceForScript = async (script: BaseScript): Promise<void> => {
        setAllowStatuses((current) => ({ ...current, [script.getId()]: State.loading }));
        if (!(await script.hasAllowance(signer))) {
            const tx = await script.requestAllowance(signer);
            await tx.wait();
        }
        setAllowStatuses((current) => ({ ...current, [script.getId()]: State.done }));
    };

    const createAndSignScripts = async () => {
        if (!chainId) throw new Error("Cannot create the script! The chain is unknown");
        if (!workbenchScripts.length)
            throw new Error("Cannot create the script! Current script is empty");

        // copying scripts so to be free to modify them
        const scripts: ICurrentScript[] = JSON.parse(JSON.stringify(workbenchScripts));
        addFollowConditions(scripts);

        // sign and request allowances if necessary
        const scriptFactory = new ScriptFactory(chainId);
        const signedScripts: BaseScript[] = [];
        for (const script of scripts) {
            try {
                const signedScript = await signScript(script, scriptFactory);
                await requestAllowanceForScript(signedScript);
                signedScripts.push(signedScript);
            } catch (err) {
                // if something goes bad (the user cancels), we clean the states
                // as the whole chain will need to be re-executed
                setSignStatuses({});
                setAllowStatuses({});
                errorToast("Something went wrong :(\nPlease let us know if the problem persists");
                throw err;
            }
        }

        // save in storage and add to Redux state
        for (const signedScript of signedScripts) {
            await StorageProxy.script.saveScript(signedScript);
            dispatch(addNewUSerScript(signedScript));
        }

        // clean and redirect to my-page
        dispatch(cleanWorkbench());
        setRedirect(true);
        successToast(`Script${signedScripts.length > 1 ? "s" : ""} successfully created`);
    };

    const addFollowConditions = (scripts: ICurrentScript[]) => {
        // add follow conditions to chain scripts together
        if (scripts.length >= 2) {
            for (let i = 1; i < scripts.length; i++) {
                scripts[i].conditions[ConditionTitles.FOLLOW] = {
                    title: ConditionTitles.FOLLOW,
                    info: "Automatically added follow-condition",
                    form: {
                        type: ScriptConditions.FOLLOW,
                        valid: true,
                        shift: 0,
                        parentScriptId: scripts[i - 1].id,
                        parentScriptExecutor: getExecutorFromScriptAction(
                            scripts[i - 1].action.form.type,
                            chainId!
                        )
                    } as IFollowConditionForm
                };
            }

            // first script will be re-executable only when the last one has been executed
            // to do so we add a follow condition with shift 1.
            scripts[0].conditions[ConditionTitles.FOLLOW] = {
                title: ConditionTitles.FOLLOW,
                info: "Automatically added follow-condition",
                form: {
                    type: ScriptConditions.FOLLOW,
                    valid: true,
                    shift: 1,
                    parentScriptId: scripts[scripts.length - 1].id,
                    parentScriptExecutor: getExecutorFromScriptAction(
                        scripts[scripts.length - 1].action.form.type,
                        chainId!
                    )
                } as IFollowConditionForm
            };
        }
    };

    const shouldRedirect = redirect || !authenticated || !supportedChain || banned;
    if (shouldRedirect) return <Navigate to="/my-page" />;

    return (
        <div className="review">
            <div className="review__scripts">
                {workbenchScripts.map((script) => (
                    <TemporaryScript
                        key={script.id}
                        script={script}
                        allowanceState={allowStatuses[script.id] ?? State.unknown}
                        signatureState={signStatuses[script.id] ?? State.unknown}
                    />
                ))}
            </div>

            <button className="review__deploy-button" onClick={() => createAndSignScripts()}>
                {workbenchScripts.length === 1
                    ? `Sign & deploy script`
                    : `Sign & Deploy ${workbenchScripts.length} scripts`}
            </button>
        </div>
    );
}
