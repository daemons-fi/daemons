import hre from "hardhat";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { contracts, printContracts } from "./daemons-contracts";
import { deployPriceRetriever } from "./single-deployments/a0-price-retriever";
import { deployDaemToken } from "./single-deployments/a1-daem-token";
import { deployGasTank } from "./single-deployments/a2-gas-tank";
import { deployTreasury } from "./single-deployments/a3-treasury";
import { deployVesting } from "./single-deployments/a4-vesting";
import { deployGasPriceFeed } from "./single-deployments/a5-gas-price-feed";
import { finalizeGasTank } from "./single-deployments/a6-finalize-gas-tank";
import { initializeToken } from "./single-deployments/a7-initialize-token";
import { deploySwapperExecutor } from "./single-deployments/b1-swapper-executor";
import { initializeSwapperExecutor } from "./single-deployments/b2-initialize-swapper-executor";
import { registerSwapperExecutor } from "./single-deployments/b3-register-swapper-in-gas-tank";
import { deployTransferExecutor } from "./single-deployments/c1-transfer-executor";
import { initializeTransferExecutor } from "./single-deployments/c2-initialize-transfer-executor";
import { registerTransferExecutor } from "./single-deployments/c3-register-transfer-in-gas-tank";
import { registerMmBaseExecutor } from "./single-deployments/d3-register-mmbase-in-gas-tank";
import { initializeMmBaseExecutor } from "./single-deployments/d2-initialize-mmbase-executor";
import { deployMmBaseExecutor } from "./single-deployments/d1-mmbase-executor";
import { registerMmAdvancedExecutor } from "./single-deployments/e3-register-mmadvanced-in-gas-tank";
import { initializeMmAdvancedExecutor } from "./single-deployments/e2-initialize-mmadvanced-executor";
import { deployMmAdvancedExecutor } from "./single-deployments/e1-mmadvanced-executor";
import { vestTokens } from "./single-deployments/a10-vesting";
import { createLP } from "./single-deployments/a9-create-LP";
import { sendEthToTreasury } from "./single-deployments/a8-send-eth-to-treasury";

async function deployDaemons() {
    // display deployer address and its balance
    const [owner] = await ethers.getSigners();
    const initialBalance = await owner.getBalance();
    console.log("Deploying contracts with the account:", owner.address);
    console.log(
        "Account balance:",
        initialBalance.div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000
    );

    // retrieve known contracts (in case this is a partial deploy)
    const currentChain = hre.network.config.chainId;
    if (!currentChain) throw new Error("Could not retrieve current chain");
    console.log(`Chain: ${currentChain}`);
    let currentContracts = contracts[currentChain];
    printContracts(currentContracts);

    // deploy side contracts
    currentContracts = await deployPriceRetriever(currentChain, currentContracts);
    currentContracts = await deployDaemToken(currentContracts);
    currentContracts = await deployGasTank(currentContracts);
    currentContracts = await deployTreasury(currentContracts);
    currentContracts = await deployVesting(currentContracts);
    currentContracts = await deployGasPriceFeed(currentContracts);
    await finalizeGasTank(currentContracts);
    await initializeToken(currentContracts);
    const amount = ethers.utils.parseEther("0.5");
    await sendEthToTreasury(currentContracts, owner, amount);
    await createLP(currentContracts);
    await vestTokens(currentContracts, owner);

    // deploy swapper executor
    currentContracts = await deploySwapperExecutor(currentContracts);
    await initializeSwapperExecutor(currentContracts);
    await registerSwapperExecutor(currentContracts);

    // deploy transfer executor
    currentContracts = await deployTransferExecutor(currentContracts);
    await initializeTransferExecutor(currentContracts);
    await registerTransferExecutor(currentContracts);

    // deploy mmBase executor
    currentContracts = await deployMmBaseExecutor(currentContracts);
    await initializeMmBaseExecutor(currentContracts);
    await registerMmBaseExecutor(currentContracts);

    // deploy MmAdvanced executor
    currentContracts = await deployMmAdvancedExecutor(currentContracts);
    await initializeMmAdvancedExecutor(currentContracts);
    await registerMmAdvancedExecutor(currentContracts);
}

deployDaemons().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
