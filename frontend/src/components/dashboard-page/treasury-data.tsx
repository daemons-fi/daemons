import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { RootState } from "../../state";
import { treasuryABI } from "@daemons-fi/abis";
import { bigNumberToFloat } from "../../utils/big-number-to-float";

interface IRawTreasuryStat {
    treasury: number;
    staked: number;
    distrInterval: number;
}

const cachedData: { [chain: string]: IRawTreasuryStat } = {};

export function TreasuryData(): JSX.Element {
    const chainId = useSelector((state: RootState) => state.wallet.chainId)!;
    const [rawData, setRawData] = useState<IRawTreasuryStat | undefined>();
    const [apr, setApr] = useState<number | undefined>();
    const [apy, setApy] = useState<number | undefined>();
    const currencySymbol = GetCurrentChain(chainId).coinSymbol;
    const currentDAEMPrice = useSelector((state: RootState) => state.prices.DAEMPriceInEth);

    const secondsInOneYear = 31104000;
    const calculateAPY = (
        toBeDistributed: number,
        staked: number,
        ethWorthOfDaem: number,
        redistributionInterval: number
    ): number =>
        (((secondsInOneYear / redistributionInterval) * toBeDistributed) / staked) *
        ethWorthOfDaem *
        100;

    const fetchRawTreasuryStats = async (): Promise<IRawTreasuryStat> => {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);

        if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
        const contractAddress = GetCurrentChain(chainId).contracts.Treasury;
        const treasuryContract = new ethers.Contract(contractAddress, treasuryABI, provider);

        const treasury = bigNumberToFloat(await treasuryContract.redistributionPool(), 5);
        const staked = bigNumberToFloat(await treasuryContract.stakedAmount(), 5);
        const distrInterval = (await treasuryContract.redistributionInterval()).toNumber();

        return {
            staked,
            treasury,
            distrInterval
        };
    };

    const fetchData = async () => {
        if (!cachedData[chainId]) {
            cachedData[chainId] = await fetchRawTreasuryStats();
        }
        setRawData(cachedData[chainId]);
    };

    useEffect(() => {
        fetchData();
    }, [chainId]);

    useEffect(() => {
        if (!rawData || !currentDAEMPrice) return;
        const apr = calculateAPY(
            rawData.treasury,
            rawData.staked,
            currentDAEMPrice,
            rawData.distrInterval
        );
        const apy = (Math.pow(1 + apr / 100 / 365, 365) - 1) * 100;
        setApr(apr);
        setApy(apy);
    }, [rawData, currentDAEMPrice]);

    return (
        <div className="treasury-stats">
            {rawData && (
                <>
                    <div className="treasury-stats__group">
                        <div className="treasury-stats__title">APR (paid in ETH)</div>
                        <div className="treasury-stats__value">{apr ? apr.toFixed(2) : "?"}%</div>
                    </div>
                    <div className="treasury-stats__group">
                        <div className="treasury-stats__title">APY (paid in {currencySymbol})</div>
                        <div className="treasury-stats__value">{apy ? apy.toFixed(2) : "?"}%</div>
                    </div>
                    <div className="treasury-stats__group">
                        <div className="treasury-stats__title">To be distributed</div>
                        <div className="treasury-stats__value">
                            {rawData.treasury} {currencySymbol}
                        </div>
                    </div>
                    <div className="treasury-stats__group">
                        <div className="treasury-stats__title">Currently staked</div>
                        <div className="treasury-stats__value">{rawData.staked} DAEM</div>
                    </div>
                </>
            )}
        </div>
    );
}
