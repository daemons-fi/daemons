import { BigNumber } from "ethers";
import { DaemonsContracts, getContract } from "../daemons-contracts";

export const createLP = async (
    contracts: DaemonsContracts,
    amountETH: BigNumber,
    amountDAEM: BigNumber
): Promise<void> => {
    const treasury = await getContract(contracts, "Treasury");

    console.log("Creating LP");
    let tx = await treasury.createLP(amountDAEM, { value: amountETH });
    await tx.wait();
    console.log(`LP created`);

    console.log(`Checking treasury`);
    await treasury.preliminaryCheck();
    console.log(`Treasury can operate`);
};
