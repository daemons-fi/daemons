import { DaemonsContracts, getContract, getContractAddress } from "../daemons-contracts";

export const initializeZapInExecutor = async (contracts: DaemonsContracts): Promise<void> => {
    console.log("Updating ZapIn Executor");

    const gasTankAddress = getContractAddress(contracts, "GasTank");
    const priceRetrieverAddress = getContractAddress(contracts, "PriceRetriever");
    const gasPriceFeedAddress = getContractAddress(contracts, "GasPriceFeed");

    const executor = await getContract(contracts, "ZapInScriptExecutor");
    await executor.setGasTank(gasTankAddress);
    await executor.setPriceRetriever(priceRetrieverAddress);
    await executor.setGasFeed(gasPriceFeedAddress);

    // final checks
    await executor.preliminaryCheck();
    console.log(`ZapIn Executor updated`);
};
