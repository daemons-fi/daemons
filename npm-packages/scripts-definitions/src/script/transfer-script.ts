import { BigNumber } from "ethers";
import { BaseScript } from "./base-script";
import { BalanceFactory } from "../condition-base-factories/balance-factory";
import { FrequencyFactory } from "../condition-base-factories/frequency-factory";
import { PriceFactory } from "../condition-base-factories/price-factory";
import { RepetitionsFactory } from "../condition-base-factories/repetitions-factory";
import { FollowFactory } from "../condition-base-factories/follow-factory";
import { ITransferAction } from "@daemons-fi/shared-definitions/build";
import { transferScriptAbi } from "@daemons-fi/abis";

export class TransferScript extends BaseScript {
  public constructor(
    private readonly message: ITransferAction,
    signature: string,
    private readonly description: string
  ) {
    super(signature);
  }

  public readonly ScriptType = "TransferScript";
  public getExecutorAddress = () => this.message.executor;
  public getExecutorAbi = () => transferScriptAbi;
  public getMessage = () => this.message;
  public getId = () => this.message.scriptId;
  public getUser = () => this.message.user;
  public getDescription = () => this.description;
  public getAmount = () => this.message.amount;
  public getTokenForAllowance = () => this.message.token;

  public static async fromStorageJson(object: any) {
    const message: ITransferAction = JSON.parse(JSON.stringify(object));

    // complex objects are broken down and need to be recreated. Sigh.
    message.chainId = BigNumber.from(object.chainId);
    message.amount = BigNumber.from(object.amount);
    message.tip = BigNumber.from(object.tip);

    message.balance = BalanceFactory.fromJson(message.balance);
    message.frequency = FrequencyFactory.fromJson(message.frequency);
    message.price = PriceFactory.fromJson(message.price);
    message.repetitions = RepetitionsFactory.fromJson(message.repetitions);
    message.follow = FollowFactory.fromJson(object.follow);

    return new TransferScript(message, object.signature, object.description);
  }
}
