import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ethers } from "ethers";
import { DaemonsContracts, getContract } from "../daemons-contracts";


interface IBeneficiary {
    address: string;
    amount: BigNumber;
  }

  const beneficiaries: IBeneficiary[] = [
    {
      address: '0x000000000000000000000000000000000000dead',
      amount: ethers.utils.parseEther("125000000"),
    },
    {
      address: '0x00000000000000000000000000000000deaddead',
      amount: ethers.utils.parseEther("125000000"),
    },
  ];

export const vestTokens = async (
    contracts: DaemonsContracts,
    owner: SignerWithAddress
): Promise<void> => {
    console.log("Vesting tokens");

    // retrieve contract
    const vesting = await getContract(contracts, "Vesting");
    const token = await getContract(contracts, "DaemonsToken");
    console.log(`Contracts retrieved`);

    // run some checks
    const ownerBalance = await token.balanceOf(owner.address);
    let totalAmountForBeneficiaries = BigNumber.from(0);
    beneficiaries.forEach((b) => {
        totalAmountForBeneficiaries = totalAmountForBeneficiaries.add(b.amount);
    });

    if (ownerBalance.gt(totalAmountForBeneficiaries)) {
        throw new Error("Not all the owner balance seems to be distributed");
    }
    if (ownerBalance.lt(totalAmountForBeneficiaries)) {
        throw new Error("Distribution amount is higher than owner balance");
    }
    console.log(`Vesting checks passed`);

    // transfer total amount to vesting contract
    await token.transfer(vesting.address, ownerBalance);
    console.log(`${ownerBalance.toString()} tokens have been sent to the vesting contract`);

    // set vesting terms for beneficiaries
    for (const beneficiary of beneficiaries) {
        await vesting.addBeneficiary(beneficiary.address, beneficiary.amount);
        console.log(
            `Beneficiary ${
                beneficiary.address
            } got assigned ${beneficiary.amount.toString()} tokens`
        );
    }

    console.log(`Vesting initialized`);
};
