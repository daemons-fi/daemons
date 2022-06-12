import React, { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gasTankABI } from "@daemons-fi/abis";
import { RootState } from "../../state";
import { Field, Form } from "react-final-form";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { promiseToast } from "../toaster";
import "./tip-jar.css";
import "../switch.css";
import { fetchTipJarBalance } from "../../state/action-creators/tip-jar-action-creators";
import { fetchDaemBalance } from "../../state/action-creators/wallet-action-creators";
import { AllowanceHelper } from "@daemons-fi/scripts-definitions/build";
import { ethers } from "ethers";

export function TipJar(): JSX.Element {
    const dispatch = useDispatch();
    const tipJarBalance = useSelector((state: RootState) => state.tipJar.balance);
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const DAEMBalance = useSelector((state: RootState) => state.wallet.DAEMBalance);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const contracts = GetCurrentChain(chainId!).contracts;
    const [toggleDeposit, setToggleDeposit] = useState<boolean>(true);
    const [needsAllowance, setNeedsAllowance] = useState<boolean>(true);

    // wallet signer and provider
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    const checkForAllowance = async () => {
        const hasAllowance = await AllowanceHelper.checkForERC20Allowance(
            walletAddress!,
            contracts.DAEMToken,
            contracts.GasTank,
            ethers.utils.parseEther("10000000000"),
            signer
        );
        setNeedsAllowance(!hasAllowance);
    };

    const requestAllowance = async () => {
        const tx = await AllowanceHelper.requestERC20Allowance(
            contracts.DAEMToken,
            contracts.GasTank,
            signer
        );
        const toastedTransaction = promiseToast(
            tx.wait,
            `Granting the allowance to the gas tank (this is a one-time action)...`,
            "Allowance successfully granted 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;
        await checkForAllowance();
    };

    useEffect(() => {
        checkForAllowance();
    }, []);

    const getGasTankContract = async () => {
        if (!IsChainSupported(chainId!)) throw new Error(`Chain ${chainId} is not supported!`);
        const contractAddress = contracts.GasTank;

        const gasTank = new ethers.Contract(contractAddress, gasTankABI, signer);
        return gasTank;
    };

    const deposit = async () => {
        const amount = parseFloat(
            (document.getElementById("id-tip-jar-amount") as HTMLInputElement).value
        );

        const ethers = require("ethers");
        const gasTank = await getGasTankContract();

        const parsedAmount = ethers.utils.parseEther(amount.toString());
        const tx = await gasTank.depositTip(parsedAmount);

        const toastedTransaction = promiseToast(
            tx.wait,
            `Depositing DAEM into the tip jar`,
            "Deposit successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchDaemBalance(walletAddress, chainId));
        dispatch(fetchTipJarBalance(walletAddress, chainId));
    };

    const withdraw = async () => {
        const amount = parseFloat(
            (document.getElementById("id-tip-jar-amount") as HTMLInputElement).value
        );

        const ethers = require("ethers");
        const gasTank = await getGasTankContract();

        const parsedAmount = ethers.utils.parseEther(amount.toString());
        const tx = await gasTank.withdrawTip(parsedAmount);

        const toastedTransaction = promiseToast(
            tx.wait,
            `Withdrawing from the tip jar`,
            "Withdrawal successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchDaemBalance(walletAddress, chainId));
        dispatch(fetchTipJarBalance(walletAddress, chainId));
    };

    const withdrawAll = async () => {
        const gasTank = await getGasTankContract();

        const tx = await gasTank.withdrawAllTip();

        const toastedTransaction = promiseToast(
            tx.wait,
            `Withdrawing from the tip jar`,
            "Withdrawal successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchDaemBalance(walletAddress, chainId));
        dispatch(fetchTipJarBalance(walletAddress, chainId));
    };

    const buttonDisabled = () => {
        const amountInput = document.getElementById("id-tip-jar-amount") as
            | HTMLInputElement
            | undefined;
        return (
            !amountInput ||
            !amountInput.value ||
            isNaN(parseFloat(amountInput.value)) ||
            parseFloat(amountInput.value) <= 0
        );
    };

    const renderLoadingMessage: () => ReactNode = () => {
        return <div className="tip-jar__loading">Loading...</div>;
    };

    const renderDepositForm: () => ReactNode = () => {
        return (
            <Form
                onSubmit={deposit}
                mutators={{
                    setMaxDaemAmount: (args, state, utils) => {
                        utils.changeValue(state, "amount", () => DAEMBalance.toString());
                        // manually enable submit button
                        (
                            document.getElementById("id-tip-jar-submit-button") as HTMLInputElement
                        ).disabled = DAEMBalance === 0;
                    }
                }}
                render={({ form, handleSubmit }) => (
                    <form className="tip-jar__form" onSubmit={handleSubmit}>
                        <Field
                            className="tip-jar__input"
                            id="id-tip-jar-amount"
                            name="amount"
                            autoComplete="off"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div
                            className="tip-jar__max-balance-button"
                            onClick={form.mutators.setMaxDaemAmount}
                        >
                            Max: {DAEMBalance}
                        </div>
                        <div className="tip-jar__buttons-container">
                            {needsAllowance ? (
                                <input
                                    className="staking__button"
                                    type="submit"
                                    onClick={requestAllowance}
                                    value="Request Allowance"
                                />
                            ) : (
                                <input
                                    disabled={buttonDisabled()}
                                    id="id-tip-jar-submit-button"
                                    className="tip-jar__button"
                                    type="submit"
                                    value="Deposit"
                                />
                            )}
                        </div>
                    </form>
                )}
            />
        );
    };

    const renderWithdrawForm: () => ReactNode = () => {
        return (
            <Form
                onSubmit={() => {}}
                mutators={{
                    setMaxDaemAmount: (args, state, utils) => {
                        if (tipJarBalance === undefined) return;
                        utils.changeValue(state, "amount", () => tipJarBalance.toString());
                        // manually enable submit button
                        (
                            document.getElementById("id-tip-jar-submit-button") as HTMLInputElement
                        ).disabled = tipJarBalance === 0;
                    }
                }}
                render={({ form, handleSubmit }) => (
                    <form className="tip-jar__form" onSubmit={handleSubmit}>
                        <Field
                            className="tip-jar__input"
                            id="id-tip-jar-amount"
                            name="amount"
                            autoComplete="off"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div
                            className="tip-jar__max-balance-button"
                            onClick={form.mutators.setMaxDaemAmount}
                        >
                            Max: {tipJarBalance}
                        </div>
                        <div className="tip-jar__buttons-container">
                            <input
                                className="tip-jar__button"
                                id="id-tip-jar-submit-button"
                                type="submit"
                                disabled={buttonDisabled()}
                                onClick={withdraw}
                                value="Withdraw"
                            />
                            <input
                                className="tip-jar__button"
                                type="submit"
                                onClick={withdrawAll}
                                value="Withdraw All"
                            />
                        </div>
                    </form>
                )}
            />
        );
    };

    return (
        <div className="card tip-jar">
            <div className="card__header">
                <div className="card__title">Tip Jar</div>

                {/* Deposit/Withdraw switch */}
                <div className="tip-jar__switch">
                    Deposit
                    <label className="switch">
                        <input
                            type="checkbox"
                            value={String(toggleDeposit)}
                            onChange={() => setToggleDeposit(!toggleDeposit)}
                        />
                        <span className="slider round"></span>
                    </label>
                    Withdraw
                </div>
            </div>

            <div>
                <div className="tip-jar__balance">
                    {tipJarBalance !== undefined ? tipJarBalance : "??"} DAEM
                </div>
                <div className="tip-jar__forms-container">
                    {tipJarBalance === undefined || walletAddress === undefined ? (
                        renderLoadingMessage()
                    ) : (
                        <div>{toggleDeposit ? renderDepositForm() : renderWithdrawForm()}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
