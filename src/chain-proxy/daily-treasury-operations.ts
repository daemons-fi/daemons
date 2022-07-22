import { BigNumber, ethers, Wallet } from "ethers";
import { treasuryABI } from "@daemons-fi/contracts";
import { getProvider, IChainWithContracts, supportedChains } from "./providers-builder";

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
    }
};

export const performDailyTreasuryOperations = async (): Promise<void> => {
    console.info({ message: `Performing daily treasury operations for all chains` });

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
    if (!thresholds) console.error(`Couldn't find thresholds for chain ${chain.id}. Skipping`);

    const commissionsRaw = await treasuryContract.commissionsPool();
    const commissions = convertToDecimal(commissionsRaw);

    const polPoolRaw = await treasuryContract.polPool();
    const polPool = convertToDecimal(polPoolRaw);

    console.log({
        message: `Daily treasury operation report`,
        chain: chain.name,
        commissions,
        polPool
    });

    if (commissions > thresholds.minCommission) {
        console.log("Claiming commission");
        try {
            await treasuryContract.claimCommission();
        } catch (error) {
            console.error({
                message: `Error while claiming commissions`,
                chain: chain.name,
                error
            });
        }
    }

    if (polPool > thresholds.minPolPool) {
        console.log("Funding LP");
        try {
            const quoteHalfETHtoDAEM = await treasuryContract.ethToDAEM(polPoolRaw.div(2));
            const minAmountDAEM = quoteHalfETHtoDAEM.mul(99).div(100);
            await treasuryContract.fundLP(minAmountDAEM);
        } catch (error) {
            console.error({
                message: `Error while funding PoL`,
                chain: chain.name,
                error
            });
        }
    }
}
