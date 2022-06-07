import { ethers, Wallet } from "ethers";
import { gasPriceFeedABI } from "@daemons-fi/abis";
import { getProvider, IChainWithContracts, supportedChains } from "./providers-builder";

export const updateGasPrices = async (): Promise<void> => {
    console.info({ message: `Updating gas prices for all chains` });

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
        const tx = await gasPriceFeedContract.setGasPrice(newGasPrice);
        await tx.wait();
        console.info({
            message: `Updated gas prices`,
            chain: chain.name,
            newGasPrice: newGasPrice.toString(),
            oldGasPrice: oldGasPrice.toString()
        });
    } catch (error) {
        console.error({
            message: "Error while updating gas price",
            chain: chain.name,
            newGasPrice: newGasPrice.toString(),
            oldGasPrice: oldGasPrice.toString(),
            error
        });
    }
}
