import { gasPriceFeedABI } from "@daemons-fi/abis/build";
import { BigNumber, ethers } from "ethers";
import { getProvider, supportedChains } from "./providers-builder";
import { CacheDuration, ServerCacher } from "./server-cacher";

/**
 * Fetch the gas price from Daemons' oracle for this chain
 * @param chainId The chain to check
 */
export async function fetchGasPrice(chainId: string): Promise<BigNumber> {
    const chain = supportedChains[chainId];
    if (!chain) throw new Error(`Cannot fetch gas price for unsupported chain ${chainId}`);

    const provider = getProvider(chainId);
    const gasPriceFeed = new ethers.Contract(
        chain.contracts.GasPriceFeed,
        gasPriceFeedABI,
        provider
    );

    return await gasPriceFeed.lastGasPrice();
}

/**
 * Fetch the gas price from Daemons' oracle for this chain, using the cached value, if it exists
 * @param chainId The chain to check
 * @param cacheDuration the maximum age of the piece of information to be considered good
 */
export const fetchGasPriceWithCache = async (
    chainId: string,
    cacheDuration: CacheDuration = CacheDuration.oneHour
) =>
    await ServerCacher.fetchData(
        `B/gasPrice/${chainId}`,
        () => fetchGasPrice(chainId),
        cacheDuration
    );
