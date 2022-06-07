import { BigNumber } from "ethers";
import { IBalanceCondition, Balance } from "../conditions/balance";
import { IFollowCondition, Follow } from "../conditions/follow";
import { IFrequencyCondition, Frequency } from "../conditions/frequency";
import { IMaxRepetitionsCondition, Repetitions } from "../conditions/max-repetitions";
import { IPriceCondition, Price } from "../conditions/price";
import { AmountType } from "../conditions/shared";

export interface ISignedZapInAction extends IZapInAction {
  signature: string;
  description: string;
}

export interface IZapInAction {
  scriptId: string;
  tokenA: string;
  tokenB: string;
  amountA: BigNumber;
  amountB: BigNumber;
  typeAmtA: AmountType;
  typeAmtB: AmountType;
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

const ZapIn = [
  { name: "scriptId", type: "bytes32" },            // the script identifier
  { name: "tokenA", type: "address" },              // the first token of the LP pair
  { name: "tokenB", type: "address" },              // the second token of the LP pair
  { name: "amountA", type: "uint256" },             // the amount of the first token
  { name: "amountB", type: "uint256" },             // the amount of the second token
  { name: "typeAmtA", type: "bytes1" },             // indicated the first amount type [Absolute, Percentage]
  { name: "typeAmtB", type: "bytes1" },             // indicated the second amount type [Absolute, Percentage]
  { name: "user", type: "address" },                // the user that is signing the transaction
  { name: "kontract", type: "address" },            // the DEX contract to interface with
  { name: "executor", type: "address" },            // the executor contract this message will be sent to
  { name: "chainId", type: "uint256" },             // the chain in which the message was signed
  { name: "tip", type: "uint256" },                 // the tip in DAEM for the executor
  { name: "balance", type: "Balance" },             // condition: balance
  { name: "frequency", type: "Frequency" },         // condition: frequency
  { name: "price", type: "Price" },                 // condition: balance
  { name: "repetitions", type: "Repetitions" },     // condition: max repetitions
  { name: "follow", type: "Follow" },               // condition: after script
];

export const zapInDomain = {
  name: "Daemons-ZapIn-v01",
};

export const zapInTypes = {
  Follow,
  Frequency,
  Balance,
  ZapIn,
  Price,
  Repetitions,
};
