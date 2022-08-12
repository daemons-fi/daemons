import { BigNumber, ethers, Wallet } from "ethers";
import { treasuryABI } from "@daemons-fi/contracts";
import { getProvider, IChainWithContracts, supportedChains } from "./providers-builder";
import { rootLogger } from "../logger";

const logger = rootLogger.child({ source: "DailyTreasuryOperations" });

const convertToDecimal = (bn: BigNumber) => bn.div(BigNumber.from(10).pow(13)).toNumber() / 100000;

type Thresholds = { minCommission: number; minPolPool: number };
const chainThresholds: { [chain: string]: Thresholds } = {
    "42": {
        minCommission: 0.001,
        minPolPool: 0.001
    },
    "4002": {
        minCommission: 1,
        minPolPool: 1
    },
    "80001": {
        minCommission: 1,
        minPolPool: 0.1
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

    const thresholds: Thresholds = chainThresholds[chain.id];
    if (!thresholds)
        logger.error({ message: `Couldn't find thresholds for chain`, chain: chain.id });

    const commissionsRaw = await treasuryContract.commissionsPool();
    const commissions = convertToDecimal(commissionsRaw);

    const polPoolRaw = await treasuryContract.polPool();
    const polPool = convertToDecimal(polPoolRaw);

    logger.debug({
        message: `Daily treasury operation report`,
        chain: chain.name,
        commissions,
        polPool,
        treasuryAddress: chain.contracts.Treasury
    });

    await claimCommissions(commissions, thresholds, chain, treasuryContract);
    await fundLpOrBuyback(polPool, thresholds, chain, treasuryContract, polPoolRaw);
}

async function claimCommissions(
    commissions: number,
    thresholds: Thresholds,
    chain: IChainWithContracts,
    treasuryContract: ethers.Contract
) {
    if (commissions > thresholds.minCommission) {
        logger.debug({ message: "Claiming commission", chain: chain.name });
        try {
            await treasuryContract.claimCommission();
        } catch (error) {
            logger.error({
                message: `Error while claiming commissions`,
                chain: chain.name,
                error
            });
        }
    }
}

async function fundLpOrBuyback(
    polPool: number,
    thresholds: Thresholds,
    chain: IChainWithContracts,
    treasuryContract: ethers.Contract,
    polPoolRaw: any
) {
    if (polPool > thresholds.minPolPool) {
        try {
            const shouldFundLp = await treasuryContract.shouldFundLP();
            const percentageDAEMInLP = await treasuryContract.percentageDAEMTokensStoredInLP();

            if (shouldFundLp) {
                logger.debug({ message: "Funding LP", chain: chain.name, percentageDAEMInLP });

                // get a quote to calculate minOutAmount.
                // as only half of the ETH is swapped for DAEM, we divide by 2.
                const quoteHalfETHtoDAEM = await treasuryContract.ethToDAEM(polPoolRaw.div(2));
                const minAmountDAEM = quoteHalfETHtoDAEM.mul(995).div(1000);

                await treasuryContract.fundLP(minAmountDAEM);
            } else {
                logger.debug({ message: "Buyback DAEM", chain: chain.name, percentageDAEMInLP });

                // get a quote to calculate minOutAmount.
                // All ETH will be used to buyback, so we use the full amount.
                const quoteFullETHtoDAEM = await treasuryContract.ethToDAEM(polPoolRaw);
                const minAmountDAEM = quoteFullETHtoDAEM.mul(995).div(1000);
                await treasuryContract.buybackDAEM(minAmountDAEM);
            }
        } catch (error) {
            logger.error({
                message: `Error while funding PoL/performing buyback`,
                chain: chain.name,
                error
            });
        }
    }
}
