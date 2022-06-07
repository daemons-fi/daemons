import { DaemonsContracts, getContract, getContractAddress } from "../daemons-contracts";

export const initializeZapOutExecutor = async (contracts: DaemonsContracts): Promise<void> => {
    console.log("Updating ZapOut Executor");

    const gasTankAddress = getContractAddress(contracts, "GasTank");
    const priceRetrieverAddress = getContractAddress(contracts, "PriceRetriever");
    const gasPriceFeedAddress = getContractAddress(contracts, "GasPriceFeed");

    const executor = await getContract(contracts, "ZapOutScriptExecutor");
    await executor.setGasTank(gasTankAddress);
    await executor.setPriceRetriever(priceRetrieverAddress);
    await executor.setGasFeed(gasPriceFeedAddress);

    // final checks
    await executor.preliminaryCheck();
    console.log(`ZapOut Executor updated`);
};
