import { BigNumber } from "ethers";
import { BaseScript } from "./base-script";
import { BalanceFactory } from "../condition-base-factories/balance-factory";
import { FrequencyFactory } from "../condition-base-factories/frequency-factory";
import { PriceFactory } from "../condition-base-factories/price-factory";
import { RepetitionsFactory } from "../condition-base-factories/repetitions-factory";
import { FollowFactory } from "../condition-base-factories/follow-factory";
import { HealthFactorFactory } from "../condition-base-factories/health-factor-factory";
import {
  BaseMoneyMarketActionType,
  IMMBaseAction,
} from "@daemons-fi/shared-definitions/build";
import { mmBaseScriptAbi } from "@daemons-fi/abis";

export class MmBaseScript extends BaseScript {
  public constructor(
    private readonly message: IMMBaseAction,
    signature: string,
    private readonly description: string
  ) {
    super(signature);
  }

  public readonly ScriptType = "MmBaseScript";
  public getExecutorAddress = () => this.message.executor;
  public getExecutorAbi = () => mmBaseScriptAbi;
  public getMessage = () => this.message;
  public getId = () => this.message.scriptId;
  public getUser = () => this.message.user;
  public getDescription = () => this.description;
  protected getAmount = () => this.message.amount;
  protected getTokenForAllowance = () => {
    switch (this.message.action) {
      case BaseMoneyMarketActionType.Deposit:
        return this.message.token;
      case BaseMoneyMarketActionType.Withdraw:
        return this.message.aToken;
      default:
        throw new Error(`Unsupported action ${this.message.action}`);
    }
  };

  public static async fromStorageJson(object: any) {
    const message: IMMBaseAction = JSON.parse(JSON.stringify(object));

    // complex objects are broken down and need to be recreated. Sigh.
    message.chainId = BigNumber.from(object.chainId);
    message.amount = BigNumber.from(object.amount);
    message.tip = BigNumber.from(object.tip);

    message.balance = BalanceFactory.fromJson(message.balance);
    message.frequency = FrequencyFactory.fromJson(message.frequency);
    message.price = PriceFactory.fromJson(message.price);
    message.repetitions = RepetitionsFactory.fromJson(message.repetitions);
    message.follow = FollowFactory.fromJson(object.follow);
    message.healthFactor = HealthFactorFactory.fromJson(object.healthFactor);

    return new MmBaseScript(message, object.signature, object.description);
  }
}
