import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance } from "../conditions/balance";
import { IFollowCondition, Follow } from "../conditions/follow";
import { IFrequencyCondition, Frequency } from "../conditions/frequency";
import { IMaxRepetitionsCondition, Repetitions } from "../conditions/max-repetitions";
import { IPriceCondition, Price } from "../conditions/price";
import { AmountType } from "../conditions/shared";

export enum ZapOutputChoice { bothTokens = 0, tokenA = 1, tokenB = 2 }

export interface ISignedZapOutAction extends IZapOutAction {
    signature: string;
    description: string;
}

export interface IZapOutAction {
    scriptId: string;
    tokenA: string;
    tokenB: string;
    amount: BigNumber;
    typeAmt: AmountType;
    outputChoice: ZapOutputChoice,
    user: string;
    kontract: string;
    executor: string;
    chainId: BigNumber;
    tip: BigNumber;
    balance: IBalanceCondition;
    frequency: IFrequencyCondition;
    price: IPriceCondition;
    repetitions: IMaxRepetitionsCondition;
    follow: IFollowCondition;
}

const ZapOut = [
    { name: "scriptId", type: "bytes32" },              // the script identifier
    { name: "tokenA", type: "address" },                // the first token of the LP pair
    { name: "tokenB", type: "address" },                // the second token of the LP pair
    { name: "amount", type: "uint256" },                // the LP amount
    { name: "typeAmt", type: "bytes1" },                // indicated the amount type [Absolute, Percentage]
    { name: "outputChoice", type: "uint8" },            // the asset received after the zapping
    { name: "user", type: "address" },                  // the user that is signing the transaction
    { name: "kontract", type: "address" },              // the DEX contract to interface with
    { name: "executor", type: "address" },              // the executor contract this message will be sent to
    { name: "chainId", type: "uint256" },               // the chain in which the message was signed
    { name: "tip", type: "uint256" },                   // the tip in DAEM for the executor
    { name: "balance", type: "Balance" },               // condition: balance
    { name: "frequency", type: "Frequency" },           // condition: frequency
    { name: "price", type: "Price" },                   // condition: balance
    { name: "repetitions", type: "Repetitions" },       // condition: max repetitions
    { name: "follow", type: "Follow" },                 // condition: after script
];

export const zapOutDomain = {
    name: "Daemons-ZapOut-v01"
};

export const zapOutTypes = {
    Follow,
    Frequency,
    Balance,
    ZapOut,
    Price,
    Repetitions,
};
