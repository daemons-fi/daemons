import { ethers, Wallet } from "ethers";
import { bigNumberToFloat, liquidityManagerABI, treasuryABI } from "@daemons-fi/contracts";
import { getProvider, IChainWithContracts, supportedChains } from "./utils/providers-builder";
import { rootLogger } from "../logger";
import { DailyStats } from "../models/daily-stats";

const logger = rootLogger.child({ source: "DailyTreasuryOperations" });

type Thresholds = { minCommission: number; minPolPool: number };
const chainThresholds: { [chain: string]: Thresholds } = {
    "42": {
        minCommission: 0.001,
        minPolPool: 0.001
    },
    "80001": {
        minCommission: 0.001,
        minPolPool: 0.01
    }
};

export const performDailyTreasuryOperations = async (): Promise<void> => {
    logger.debug({ message: `Performing daily treasury operations for all chains` });

    for (let chain of Object.values(supportedChains)) {
        await performDailyTreasuryOperationsForChain(chain);
    }
};

async function performDailyTreasuryOperationsForChain(chain: IChainWithContracts): Promise<void> {
    const provider = getProvider(chain.id);
    const privateKey = process.env.ADMIN_WALLET_PRIVATE_KEY!;
    const walletSigner = new Wallet(privateKey, provider);
    const treasuryContract = new ethers.Contract(
        chain.contracts.Treasury,
        treasuryABI,
        walletSigner
    );
    const liquidityManagerContract = new ethers.Contract(
        chain.contracts.ILiquidityManager,
        liquidityManagerABI,
        walletSigner
    );

    const thresholds: Thresholds = chainThresholds[chain.id];
    if (!thresholds)
        logger.error({ message: `Couldn't find thresholds for chain`, chain: chain.id });

    const commissionsRaw = await treasuryContract.commissionsPool();
    const commissions = bigNumberToFloat(commissionsRaw, 6);

    const polPoolRaw = await treasuryContract.polPool();
    const polPool = bigNumberToFloat(polPoolRaw, 6);

    logger.debug({
        message: `Daily treasury operation report`,
        chain: chain.name,
        commissions,
        polPool,
        treasuryAddress: chain.contracts.Treasury
    });

    const preBalance = await provider.getBalance(walletSigner.address);
    const claimedCommissions = await claimCommissions(
        commissions,
        thresholds,
        chain,
        treasuryContract
    );
    const { treasuryAddedToLP, treasuryBuybacks } = await fundLpOrBuyback(
        polPool,
        thresholds,
        chain,
        treasuryContract,
        liquidityManagerContract,
        polPoolRaw
    );
    const postBalance = await provider.getBalance(walletSigner.address);
    const spent = bigNumberToFloat(preBalance.sub(postBalance), 6);
    await updateDailyStats(
        chain.name,
        spent,
        claimedCommissions,
        treasuryAddedToLP,
        treasuryBuybacks
    );
}

async function claimCommissions(
    commissions: number,
    thresholds: Thresholds,
    chain: IChainWithContracts,
    treasuryContract: ethers.Contract
): Promise<number> {
    if (commissions > thresholds.minCommission) {
        logger.debug({ message: "Claiming commission", chain: chain.name });
        try {
            await (await treasuryContract.claimCommission()).wait();
            return commissions;
        } catch (error) {
            logger.error({
                message: `Error while claiming commissions`,
                chain: chain.name,
                error
            });
        }
    }
    return 0;
}

async function fundLpOrBuyback(
    polPool: number,
    thresholds: Thresholds,
    chain: IChainWithContracts,
    treasuryContract: ethers.Contract,
    liquidityManagerContract: ethers.Contract,
    polPoolRaw: any
): Promise<{ treasuryAddedToLP: number; treasuryBuybacks: number }> {
    if (polPool > thresholds.minPolPool) {
        try {
            const shouldFundLp = await treasuryContract.shouldFundLP();
            const percentageDAEMInLP = await liquidityManagerContract.percentageOfDAEMInLP(
                treasuryContract.address
            );

            if (shouldFundLp) {
                logger.debug({ message: "Funding LP", chain: chain.name, percentageDAEMInLP });

                // get a quote to calculate minOutAmount.
                // as only half of the ETH is swapped for DAEM, we divide by 2.
                const quoteHalfETHtoDAEM = await treasuryContract.ethToDAEM(polPoolRaw.div(2));
                const minAmountDAEM = quoteHalfETHtoDAEM.mul(995).div(1000);

                await (await treasuryContract.fundLP(minAmountDAEM)).wait();
                return { treasuryAddedToLP: polPool, treasuryBuybacks: 0 };
            } else {
                logger.debug({ message: "Buyback DAEM", chain: chain.name, percentageDAEMInLP });

                // get a quote to calculate minOutAmount.
                // All ETH will be used to buyback, so we use the full amount.
                const quoteFullETHtoDAEM = await treasuryContract.ethToDAEM(polPoolRaw);
                const minAmountDAEM = quoteFullETHtoDAEM.mul(995).div(1000);
                await (await treasuryContract.buybackDAEM(minAmountDAEM)).wait();
                return { treasuryAddedToLP: 0, treasuryBuybacks: polPool };
            }
        } catch (error) {
            logger.error({
                message: `Error while funding PoL/performing buyback`,
                chain: chain.name,
                error
            });
        }
    }
    return { treasuryAddedToLP: 0, treasuryBuybacks: 0 };
}

async function updateDailyStats(
    chain: string,
    spentAmount: number,
    claimedCommissions: number,
    treasuryAddedToLP: number,
    treasuryBuybacks: number
): Promise<void> {
    const dailyStat = await DailyStats.fetchOrCreate(chain);
    dailyStat.treasuryCommissionClaimed += claimedCommissions;
    dailyStat.treasuryAddedToLP += treasuryAddedToLP;
    dailyStat.treasuryBuybacks += treasuryBuybacks;
    dailyStat.treasuryManagementCost += spentAmount;
    await dailyStat.save();
}
