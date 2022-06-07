import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseScript } from "@daemons-fi/scripts-definitions";
import { VerificationFailedScript, VerificationState } from "@daemons-fi/scripts-definitions";
import { RootState } from "../../state";
import { fetchGasTankClaimable } from "../../state/action-creators/gas-tank-action-creators";
import { removeUserScript } from "../../state/action-creators/script-action-creators";
import { BigNumber, ethers, utils } from "ethers";
import { promiseToast } from "../toaster";
import { StorageProxy } from "../../data/storage-proxy";
import { ScriptProxy } from "../../data/storage-proxy/scripts-proxy";
import { getGasLimitForScript } from "../../data/script-gas-limits";
import { GetCurrentChain } from "../../data/chain-info";
import { bigNumberToFloat } from "../../utils/big-number-to-float";


export const MyPageScript = ({ script }: { script: BaseScript }) => {
    const [verification, setVerification] = useState(script.getVerification());
    const dispatch = useDispatch();
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const currencySymbol = GetCurrentChain(chainId!).coinSymbol;
    const currentGasPrice = useSelector((state: RootState) => state.gasPriceFeed.price) ?? 0;

    // wallet signer and provider
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    // script execution costs
    const ethCost = bigNumberToFloat(getGasLimitForScript(script.ScriptType).mul(currentGasPrice), 5);
    const daemCost = bigNumberToFloat(script.getMessage().tip as BigNumber);

    const revokeScript = async () => {
        const tx = await script.revoke(signer);

        const revokeTransaction = promiseToast(
            tx.wait,
            `Revoking script ${script.getShortId()}. Please do not leave Daemons`,
            "Script successfully revoked 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        const receipt: ethers.providers.TransactionReceipt = (await revokeTransaction) as any;
        if (receipt.status === 1) await StorageProxy.script.revokeScript(script.getId());
        dispatch(removeUserScript(script));
    };

    const verifyScript = async () => {
        const verification = await script.verify(signer);
        setVerification(verification);

        const isBroken =
            verification.state === VerificationState.errorCode &&
            (verification as VerificationFailedScript).code.includes("[FINAL]");
        if (isBroken) await ScriptProxy.markAsBroken(script.getId());
    };

    const executeScript = async () => {
        const tx = await script.execute(signer);
        setVerification(script.getVerification());
        dispatch(fetchGasTankClaimable(walletAddress, chainId));
        tx?.wait().then(() => verifyScript());
    };

    const requestAllowance = async () => {
        const tx = await script.requestAllowance(signer);
        const allowanceTransaction = promiseToast(
            tx.wait,
            `Giving the necessary allowance to Daemons to execute this script`,
            "Allowance successfully granted 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await allowanceTransaction;
        await verifyScript();
    };

    if (verification.state === VerificationState.unverified) {
        verifyScript();
    }

    return (
        <div className="script">
            {/* Description */}
            <div className="script__description">{script.getDescription()}</div>

            {/* Verification State */}
            <div className="script__verificationState">{verification.toString()}</div>

            {/* Execution Costs */}
            <div className="script__execution-costs">
                <div>Execution costs:</div>
                <div className="script__execution-costs-table">
                    <div>
                        {ethCost} {currencySymbol}
                    </div>
                    {daemCost > 0 ? <div>{daemCost} DAEM</div> : null}
                </div>
            </div>

            {/* Script Actions */}
            <div className="script__actions">
                <button onClick={revokeScript} className="script__button">
                    Revoke
                </button>
                <button onClick={verifyScript} className="script__button">
                    Verify
                </button>

                {verification.state === VerificationState.valid ? (
                    <button onClick={executeScript} className="script__button">
                        Execute
                    </button>
                ) : verification.state === VerificationState.errorCode &&
                  (verification as VerificationFailedScript).code.includes("ALLOWANCE") ? (
                    <button onClick={requestAllowance} className="script__button">
                        Require Allowance
                    </button>
                ) : null}
            </div>

            <button
                onClick={() => alert(JSON.stringify(script.getMessage(), null, " "))}
                className="script__info-button"
            >
                i
            </button>
        </div>
    );
};
