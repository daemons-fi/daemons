import React, { ReactNode, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gasTankABI } from "@daemons-fi/abis";
import { RootState } from "../../state";
import { fetchGasTankBalance } from "../../state/action-creators/gas-tank-action-creators";
import { Field, Form } from "react-final-form";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { promiseToast } from "../toaster";
import "./gas-tank.css";
import "../switch.css";

export function GasTank(): JSX.Element {
    const dispatch = useDispatch();
    const gasTankBalance = useSelector((state: RootState) => state.gasTank.balance);
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const ETHBalance = useSelector((state: RootState) => state.wallet.ETHBalance);
    const [toggleDeposit, setToggleDeposit] = useState<boolean>(true);
    const currencySymbol = GetCurrentChain(chainId!).coinSymbol;

    const getGasTankContract = async () => {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        if (!IsChainSupported(chainId!)) throw new Error(`Chain ${chainId} is not supported!`);
        const contractAddress = GetCurrentChain(chainId!).contracts.GasTank;

        const gasTank = new ethers.Contract(contractAddress, gasTankABI, signer);
        return gasTank;
    };

    const deposit = async () => {
        const amount = parseFloat(
            (document.getElementById("id-gas-tank-amount") as HTMLInputElement).value
        );

        const ethers = require("ethers");
        const gasTank = await getGasTankContract();

        const tx = await gasTank.depositGas({ value: ethers.utils.parseEther(amount.toString()) });

        const toastedTransaction = promiseToast(
            tx.wait,
            `Depositing into the gas tank`,
            "Deposit successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchGasTankBalance(walletAddress, chainId));
    };

    const withdraw = async () => {
        const amount = parseFloat(
            (document.getElementById("id-gas-tank-amount") as HTMLInputElement).value
        );

        const ethers = require("ethers");
        const gasTank = await getGasTankContract();

        const tx = await gasTank.withdrawGas(ethers.utils.parseEther(amount.toString()));

        const toastedTransaction = promiseToast(
            tx.wait,
            `Withdrawing from the gas tank`,
            "Withdrawal successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchGasTankBalance(walletAddress, chainId));
    };

    const withdrawAll = async () => {
        const gasTank = await getGasTankContract();

        const tx = await gasTank.withdrawAllGas();

        const toastedTransaction = promiseToast(
            tx.wait,
            `Withdrawing from the gas tank`,
            "Withdrawal successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchGasTankBalance(walletAddress, chainId));
    };

    const buttonDisabled = () => {
        const amountInput = document.getElementById("id-gas-tank-amount") as
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
        return <div className="gas-tank__loading">Loading...</div>;
    };

    const renderDepositForm: () => ReactNode = () => {
        return (
            <Form
                onSubmit={deposit}
                mutators={{
                    setMaxEthAmount: (args, state, utils) => {
                        utils.changeValue(state, "amount", () => ETHBalance.toString());
                        // manually enable submit button
                        (
                            document.getElementById("id-gas-tank-submit-button") as HTMLInputElement
                        ).disabled = ETHBalance === 0;
                    }
                }}
                render={({ form, handleSubmit }) => (
                    <form className="gas-tank__form" onSubmit={handleSubmit}>
                        <Field
                            className="gas-tank__input"
                            id="id-gas-tank-amount"
                            name="amount"
                            autoComplete="off"
                            component="input"
                            type="number"
                            placeholder="0.0"
                            value={""}
                        />
                        <div
                            className="tip-jar__max-balance-button"
                            onClick={form.mutators.setMaxEthAmount}
                        >
                            Max: {ETHBalance}
                        </div>
                        <div className="gas-tank__buttons-container">
                            <input
                                disabled={buttonDisabled()}
                                id="id-gas-tank-submit-button"
                                className="gas-tank__button"
                                type="submit"
                                value="Deposit"
                            />
                        </div>
                    </form>
                )}
            />
        );
    };

    const renderWithdrawForm: () => ReactNode = () => {
        return (
            <Form
                onSubmit={() => {
                    /* Handled in the buttons */
                }}
                mutators={{
                    setMaxEthAmount: (args, state, utils) => {
                        if (gasTankBalance === undefined) return;
                        utils.changeValue(state, "amount", () => gasTankBalance.toString());
                        // manually enable submit button
                        (
                            document.getElementById("id-gas-tank-submit-button") as HTMLInputElement
                        ).disabled = gasTankBalance === 0;
                    }
                }}
                render={({ form, handleSubmit }) => (
                    <form className="gas-tank__form" onSubmit={handleSubmit}>
                        <Field
                            className="gas-tank__input"
                            id="id-gas-tank-amount"
                            name="amount"
                            autoComplete="off"
                            component="input"
                            type="number"
                            placeholder="0.0"
                            value={""}
                        />
                        <div
                            className="tip-jar__max-balance-button"
                            onClick={form.mutators.setMaxEthAmount}
                        >
                            Max: {gasTankBalance}
                        </div>
                        <div className="gas-tank__buttons-container">
                            <input
                                className="gas-tank__button"
                                id="id-gas-tank-submit-button"
                                type="submit"
                                disabled={buttonDisabled()}
                                onClick={withdraw}
                                value="Withdraw"
                            />
                            <input
                                className="gas-tank__button"
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
        <div className="card gas-tank">
            <div className="card__header">
                <div className="card__title">Gas Tank</div>

                {/* Deposit/Withdraw switch */}
                <div className="gas-tank__switch">
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
                <div className="gas-tank__balance">
                    {gasTankBalance !== undefined ? gasTankBalance : "??"} {currencySymbol}
                </div>
                <div className="gas-tank__forms-container">
                    {gasTankBalance === undefined || walletAddress === undefined ? (
                        renderLoadingMessage()
                    ) : (
                        <div>{toggleDeposit ? renderDepositForm() : renderWithdrawForm()}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
