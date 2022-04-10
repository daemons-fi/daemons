import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import { GetCurrentChain } from "../../data/chain-info";
import { RootState } from "../../state";
import {
    fetchStakingBalance,
    fetchStakingClaimable
} from "../../state/action-creators/staking-action-creators";
import { AllowanceHelper } from "../../utils/allowance-helper";
import { getAbiFor } from "../../utils/get-abi";
import "./staking.css";

export function Staking() {
    const dispatch = useDispatch();
    const balance = useSelector((state: RootState) => state.staking.balance);
    const claimable = useSelector((state: RootState) => state.staking.claimable);
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const [toggleDeposit, setToggleDeposit] = useState<boolean>(true);
    const [needsAllowance, setNeedsAllowance] = useState<boolean>(true);
    const contracts = GetCurrentChain(chainId!).contracts;

    const checkForAllowance = async () => {
        const allowanceHelper = new AllowanceHelper();
        const hasAllowance = await allowanceHelper.checkForAllowance(
            walletAddress!,
            contracts.DAEMToken,
            contracts.Treasury,
            ethers.utils.parseEther("100000")
        );
        console.log("hasAllowance", hasAllowance);
        setNeedsAllowance(!hasAllowance);
    };

    useEffect(() => {
        dispatch(fetchStakingBalance(walletAddress, chainId));
        dispatch(fetchStakingClaimable(walletAddress, chainId));
        checkForAllowance();
    }, []);

    const exit = async () => {
        if (!claimable && !balance) {
            alert("No balance, nor anything claimable");
            return;
        }

        const treasury = await getTreasuryContract();
        const tx = await treasury.exit();
        await tx.wait();

        dispatch(fetchStakingBalance(walletAddress, chainId));
        dispatch(fetchStakingClaimable(walletAddress, chainId));
    };

    const requestAllowance = async () => {
        const allowanceHelper = new AllowanceHelper();
        const tx = await allowanceHelper.requestAllowance(contracts.DAEMToken, contracts.Treasury);
        await tx.wait();
        await checkForAllowance();
    };

    const stake = async () => {
        const amount = parseFloat((document.getElementById("id-amount") as HTMLInputElement).value);

        const treasury = await getTreasuryContract();
        const tx = await treasury.stake(ethers.utils.parseEther(amount.toString()));
        await tx.wait();

        dispatch(fetchStakingBalance(walletAddress, chainId));
        (document.getElementById("id-amount") as HTMLInputElement).value = "";
    };

    const withdraw = async () => {
        const amount = parseFloat((document.getElementById("id-amount") as HTMLInputElement).value);

        const treasury = await getTreasuryContract();
        const tx = await treasury.withdraw(ethers.utils.parseEther(amount.toString()));
        await tx.wait();

        dispatch(fetchStakingBalance(walletAddress, chainId));
        (document.getElementById("id-amount") as HTMLInputElement).value = "";
    };

    const claim = async () => {
        if (!claimable) {
            alert("Nothing to claim");
            return;
        }

        const treasury = await getTreasuryContract();
        const tx = await treasury.getReward();
        await tx.wait();

        dispatch(fetchStakingClaimable(walletAddress, chainId));
    };

    const getTreasuryContract = async () => {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = contracts.Treasury;
        const contractAbi = await getAbiFor("Treasury");
        const treasury = new ethers.Contract(contractAddress, contractAbi, signer);
        return treasury;
    };

    const renderLoadingMessage: () => JSX.Element = () => {
        return <div className="staking__loading">Loading...</div>;
    };

    const renderDepositForm: () => JSX.Element = () => {
        return (
            <Form
                className="staking__form"
                onSubmit={() => {
                    /* Handled in the buttons */
                }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className="staking__input"
                            id="id-amount"
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div className="staking__buttons-container">
                            {needsAllowance ? (
                                <input
                                    className="staking__button"
                                    type="submit"
                                    onClick={requestAllowance}
                                    value="Request Allowance"
                                />
                            ) : (
                                <input
                                    className="staking__button"
                                    type="submit"
                                    onClick={stake}
                                    value="Stake"
                                />
                            )}
                        </div>
                    </form>
                )}
            />
        );
    };

    const renderWithdrawForm: () => JSX.Element = () => {
        return (
            <Form
                className="staking__form"
                onSubmit={() => {
                    /* Handled in the buttons */
                }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className="staking__input"
                            id="id-amount"
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div className="staking__buttons-container">
                            <input
                                disabled={!balance}
                                className="staking__button"
                                type="submit"
                                onClick={withdraw}
                                value="Unstake"
                            />
                            <input
                                disabled={!balance}
                                className="staking__button"
                                type="submit"
                                onClick={exit}
                                value="Unstake &amp; Claim"
                            />
                        </div>
                    </form>
                )}
            />
        );
    };

    return (
        <div className="card staking">
            <div className="card__header">
                <div className="card__title">Stake</div>

                {/* Deposit/Withdraw switch */}
                <div className="staking__switch">
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
                <div className="staking__balance">
                    {balance !== undefined ? balance : "??"} DAEM
                </div>
                <div className="staking__forms-container">
                    {balance === undefined || walletAddress === undefined ? (
                        renderLoadingMessage()
                    ) : (
                        <div>{toggleDeposit ? renderDepositForm() : renderWithdrawForm()}</div>
                    )}
                </div>
            </div>
            <div className="staking__reward-info">
                <div className="staking__claimable">
                    {claimable !== undefined ? `Claimable: ${claimable} ETH` : "??"}
                </div>
                <input
                    disabled={!claimable}
                    className="staking__button staking__button--small"
                    type="submit"
                    onClick={claim}
                    value="Claim"
                />
            </div>
        </div>
    );
}
