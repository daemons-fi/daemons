import { BigNumber, ethers } from "ethers";
import { treasuryABI } from "@daemons-fi/contracts";
import { getProvider, IChainWithContracts, supportedChains } from "./providers-builder";

interface ITreasuryStat {
    apr: number;
    treasury: number;
    staked: number;
    pol: number;
    distributed: number;
    chain: string;
}

export const getTreasuryStats = async (): Promise<ITreasuryStat[]> => {
    const stats: ITreasuryStat[] = [];
    for (const chain of Object.values(supportedChains)) {
        const chainStat = await getTreasuryStatsForChain(chain);
        stats.push(chainStat);
    }
    return stats;
};

async function getTreasuryStatsForChain(chain: IChainWithContracts): Promise<ITreasuryStat> {
    const provider = getProvider(chain.id);
    const treasuryContract = new ethers.Contract(chain.contracts.Treasury, treasuryABI, provider);

    const convertToDecimal = (bn: BigNumber) =>
        bn.div(BigNumber.from(10).pow(13)).toNumber() / 100000;

    const treasury = convertToDecimal(await treasuryContract.redistributionPool());
    const staked = convertToDecimal(await treasuryContract.stakedAmount());
    const distrInterval = (await treasuryContract.redistributionInterval()).toNumber();
    const apr = calculateAPY(treasury, staked, 1, distrInterval);

    return {
        apr,
        treasury,
        staked,
        distributed: 0,
        pol: 0,
        chain: chain.name
    };
}

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
