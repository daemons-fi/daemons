import { BigNumber, ethers } from "ethers";
import { gasPriceFeedABI } from "@daemons-fi/abis";
import { getProvider, IChainWithContracts, supportedChains } from "./providers-builder";

export const updateGasPrices = async (): Promise<void> => {
    for (let chain of Object.values(supportedChains)) {
        await updateGasPriceForChain(chain);
    }
};

async function updateGasPriceForChain(chain: IChainWithContracts): Promise<void> {
    const provider = getProvider(chain.id);
    const gasPriceFeedContract = new ethers.Contract(
        chain.contracts.GasPriceFeed,
        gasPriceFeedABI,
        provider
    );

    const currentGasPrice = (await provider.getFeeData()).gasPrice!;
    const priceInGwei = ethers.utils.formatUnits(currentGasPrice, "gwei");
    console.log(`Chain ${chain.name}, gas price ${priceInGwei}`);
}
