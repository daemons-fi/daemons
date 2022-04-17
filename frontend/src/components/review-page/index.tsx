import React, { useState } from "react";
import { ScriptFactory } from "../../script-factories";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state";
import { TemporaryScript } from "./temporary-script";
import "./styles.css";
import { StorageProxy } from "../../data/storage-proxy";
import { addNewScript } from "../../state/action-creators/script-action-creators";
import { BaseScript } from "../../data/script/base-script";
import { Navigate } from "react-router-dom";
import { GetCurrentChain } from "../../data/chain-info";
import { cleanWorkbench } from "../../state/action-creators/workbench-action-creators";

export function ReviewPage(): JSX.Element {
    // redux
    const dispatch = useDispatch();
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);
    const workbenchScripts = useSelector((state: RootState) => state.workbench.scripts);

    // states
    const [redirect, setRedirect] = useState<boolean>(false);

    const createAndSignScripts = async () => {
        if (!chainId) throw new Error("Cannot create the script! The chain is unknown");
        if (!workbenchScripts.length)
            throw new Error("Cannot create the script! Current script is empty");

        const scriptFactory = new ScriptFactory(chainId);
        const signedScripts: BaseScript[] = [];
        for (const script of workbenchScripts) {
            const signedScript = await scriptFactory.SubmitScriptsForSignature(script);
            if (!(await signedScript.hasAllowance())) {
                await signedScript.requestAllowance();
            }

            signedScripts.push(signedScript);
        }

        for (const signedScript of signedScripts) {
            await StorageProxy.script.saveScript(signedScript);
            dispatch(addNewScript(signedScript));
        }

        dispatch(cleanWorkbench());
        setRedirect(true);
    };

    const shouldRedirect = redirect || !authenticated || !supportedChain;
    console.log("shouldRedirect", redirect);
    if (shouldRedirect) return <Navigate to="/my-page" />;

    return (
        <div className="review">
            <div className="review__scripts">
                {workbenchScripts.map((script) => (
                    <TemporaryScript key={script.id} script={script} />
                ))}
            </div>

            <button className="review__deploy-button" onClick={createAndSignScripts}>
                {workbenchScripts.length === 1
                    ? `Sign & deploy script`
                    : `Sign & Deploy ${workbenchScripts.length} scripts`}
            </button>
        </div>
    );
}
