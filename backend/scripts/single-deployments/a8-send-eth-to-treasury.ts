import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { DaemonsContracts, getContract } from "../daemons-contracts";

export const sendEthToTreasury = async (
    contracts: DaemonsContracts,
    owner: SignerWithAddress,
    amount: BigNumber
): Promise<void> => {
    console.log("Sending ETH to treasury");

    const treasury = await getContract(contracts, "Treasury");
    const tx = await owner.sendTransaction({ to: treasury.address, value: amount });
    await tx.wait();

    console.log(`${amount.toString()} ETH sent`);
};
