import { BigNumber } from "ethers";
import { IBalanceCondition, Balance } from "../conditions/balance";
import { IFollowCondition, Follow } from "../conditions/follow";
import { IFrequencyCondition, Frequency } from "../conditions/frequency";
import { IMaxRepetitionsCondition, Repetitions } from "../conditions/max-repetitions";
import { IPriceCondition, Price } from "../conditions/price";
import { AmountType } from "../conditions/shared";

export interface ISignedBeefyAction extends IBeefyAction {
    signature: string;
    description: string;
}

export enum BeefyActionType { Deposit = 0, Withdraw = 1 }

export interface IBeefyAction {
    scriptId: string;
    lpAddress: string;
    mooAddress: string;
    action: BeefyActionType;
    typeAmt: AmountType;
    amount: BigNumber;
    user: string;
    executor: string;
    chainId: BigNumber;
    tip: BigNumber;
    balance: IBalanceCondition;
    frequency: IFrequencyCondition;
    price: IPriceCondition;
    repetitions: IMaxRepetitionsCondition;
    follow: IFollowCondition;
}

const Beefy = [
    { name: "scriptId", type: "bytes32" },              // the script identifier
    { name: "lpAddress", type: "address" },             // the LP to deposit
    { name: "mooAddress", type: "address" },            // the mooToken (== Beefy Vault)
    { name: "action", type: "bytes1" },                 // the action to perform [deposit, withdraw]
    { name: "typeAmt", type: "bytes1" },                // the amount type [absolute, percentage]
    { name: "amount", type: "uint256" },                // the amount to deposit/withdraw
    { name: "user", type: "address" },                  // the user that is signing the transaction
    { name: "executor", type: "address" },              // the executor contract this message will be sent to
    { name: "chainId", type: "uint256" },               // the chain in which the message was signed
    { name: "tip", type: "uint256" },                   // the tip in DAEM for the executor
    { name: "balance", type: "Balance" },               // condition: balance
    { name: "frequency", type: "Frequency" },           // condition: frequency
    { name: "price", type: "Price" },                   // condition: balance
    { name: "repetitions", type: "Repetitions" },       // condition: max repetitions
    { name: "follow", type: "Follow" },                 // condition: follow script
];

export const BeefyDomain = {
    name: "Daemons-Beefy-v01"
};

export const BeefyTypes = {
    Frequency,
    Balance,
    Beefy,
    Price,
    Repetitions,
    Follow
};
