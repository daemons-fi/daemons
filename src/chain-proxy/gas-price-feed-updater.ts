import { ethers, Wallet } from "ethers";
import { gasPriceFeedABI } from "@daemons-fi/contracts";
import { getProvider, IChainWithContracts, supportedChains } from "./providers-builder";
import { rootLogger } from "../logger";

const logger = rootLogger.child({ source: "GasPriceFeedUpdater" });

export const updateGasPrices = async (): Promise<void> => {
    logger.debug({ message: `Updating gas prices for all chains` });

    for (let chain of Object.values(supportedChains)) {
        await updateGasPriceForChain(chain);
    }
};

async function updateGasPriceForChain(chain: IChainWithContracts): Promise<void> {
    const provider = getProvider(chain.id);
    const privateKey = process.env.ADMIN_WALLET_PRIVATE_KEY!;
    const walletSigner = new Wallet(privateKey, provider);
    const gasPriceFeedContract = new ethers.Contract(
        chain.contracts.GasPriceFeed,
        gasPriceFeedABI,
        walletSigner
    );

    const newGasPrice = (await provider.getFeeData()).gasPrice!;
    const oldGasPrice = await gasPriceFeedContract.lastGasPrice();

    try {
        const GAS_UPDATE_THRESHOLD = 1000000;
        const deltaPrice = Math.abs(newGasPrice.toNumber() - oldGasPrice.toNumber());
        if (deltaPrice < GAS_UPDATE_THRESHOLD) {
            logger.debug({
                message: `Gas price update skipped as delta < threshold`,
                chain: chain.name,
                gasPriceFeed: chain.contracts.GasPriceFeed,
                newGasPrice: newGasPrice.toString(),
                oldGasPrice: oldGasPrice.toString()
            });
            return;
        }

        const tx = await gasPriceFeedContract.setGasPrice(newGasPrice);
        await tx.wait();
        logger.debug({
            message: `Updated gas prices`,
            chain: chain.name,
            gasPriceFeed: chain.contracts.GasPriceFeed,
            newGasPrice: newGasPrice.toString(),
            oldGasPrice: oldGasPrice.toString()
        });
    } catch (error) {
        logger.error({
            message: "Error while updating gas price",
            chain: chain.name,
            newGasPrice: newGasPrice.toString(),
            oldGasPrice: oldGasPrice.toString(),
            error
        });
    }
}
