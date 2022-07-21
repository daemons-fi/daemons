import { UniswapV2RouterABI } from "@daemons-fi/abis/build";
import { BigNumber, ethers, utils } from "ethers";
import { getProvider, supportedChains } from "./providers-builder";
import { CacheDuration, ServerCacher } from "./server-cacher";

/**
 * Fetch the DAEM price for this chain
 * @param chainId The chain to check
 */
export async function fetchDAEMPriceInETH(chainId: string): Promise<BigNumber> {
    const chain = supportedChains[chainId];
    if (!chain) throw new Error(`Cannot fetch DAEM price for unsupported chain ${chainId}`);

    const provider = getProvider(chainId);
    const router = new ethers.Contract(
        chain.contracts.IUniswapV2Router01,
        UniswapV2RouterABI,
        provider
    );

    const weth = await router.WETH();
    const path = [chain.contracts.DaemonsToken, weth];

    // Get amount of ETH for 1 DAEM
    return (await router.getAmountsOut(utils.parseEther("1"), path))[1];
}

/**
 * Fetch the DAEM price for this chain, using the cached value, if it exists
 * @param chainId The chain to check
 * @param cacheDuration the maximum age of the piece of information to be considered good
 */
export const fetchDAEMPriceInETHWithCache = async (
    chainId: string,
    cacheDuration: CacheDuration = CacheDuration.oneHour
) =>
    await ServerCacher.fetchData(
        `B/DAEMPriceInETH/${chainId}`,
        () => fetchDAEMPriceInETH(chainId),
        cacheDuration
    );
