import { ethers } from "hardhat";
import { DaemonsContracts, getContract } from "../daemons-contracts";

export const createLP = async (contracts: DaemonsContracts): Promise<void> => {
    const provider = ethers.provider;
    const treasury = await getContract(contracts, "Treasury");

    const balance = await provider.getBalance(treasury.address);
    console.log(`Treasury balance ${balance.toString()}`);

    console.log("Creating LP");
    let tx = await treasury.createLP();
    await tx.wait();
    console.log(`LP created`);

    console.log(`Checking treasury`);
    await treasury.preliminaryCheck();
    console.log(`Treasury can operate`);
};
