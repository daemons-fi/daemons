import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, ethers } from "ethers";
import { BaseScript } from "./base-script";
import { BalanceFactory } from "../condition-base-factories/balance-factory";
import { FrequencyFactory } from "../condition-base-factories/frequency-factory";
import { PriceFactory } from "../condition-base-factories/price-factory";
import { RepetitionsFactory } from "../condition-base-factories/repetitions-factory";
import { FollowFactory } from "../condition-base-factories/follow-factory";
import { HealthFactorFactory } from "../condition-base-factories/health-factor-factory";
import {
  AdvancedMoneyMarketActionType,
  IMMAdvancedAction,
} from "@daemons-fi/shared-definitions/build";
import { AllowanceHelper } from "../allowance-helper";
import { mmAdvancedScriptAbi } from "@daemons-fi/abis";

export class MmAdvancedScript extends BaseScript {
  public constructor(
    private readonly message: IMMAdvancedAction,
    signature: string,
    private readonly description: string
  ) {
    super(signature);
  }

  public readonly ScriptType = "MmAdvancedScript";
  public getExecutorAddress = () => this.message.executor;
  public getExecutorAbi = () => mmAdvancedScriptAbi;
  public getMessage = () => this.message;
  public getId = () => this.message.scriptId;
  public getUser = () => this.message.user;
  public getDescription = () => this.description;
  protected getAmount = () => this.message.amount;
  protected getTokenForAllowance = () =>
    this.message.action === AdvancedMoneyMarketActionType.Repay
      ? this.message.token
      : this.message.debtToken;

  public static async fromStorageJson(object: any) {
    const message: IMMAdvancedAction = JSON.parse(JSON.stringify(object));

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

    return new MmAdvancedScript(message, object.signature, object.description);
  }

  // Override parent hasAllowance, ONLY for borrow,
  // as we need to use a different contract.
  public async hasAllowance(
    signerOrProvider: ethers.providers.Provider | ethers.Signer
  ): Promise<boolean> {
    if (this.message.action === AdvancedMoneyMarketActionType.Repay) {
      return super.hasAllowance(signerOrProvider);
    }

    return await AllowanceHelper.checkForAAVEDebtTokenAllowance(
      this.getUser(),
      this.getTokenForAllowance(),
      this.getExecutorAddress(),
      this.getAmount(),
      signerOrProvider
    );
  }

  // Override parent requestAllowance, ONLY for borrow,
  // as we need to use a different contract.
  public async requestAllowance(
    signer: ethers.Signer
  ): Promise<TransactionResponse> {
    if (this.message.action === AdvancedMoneyMarketActionType.Repay) {
      return super.requestAllowance(signer);
    }

    return await AllowanceHelper.requestAAVEDebtTokenAllowance(
      this.getTokenForAllowance(),
      this.getExecutorAddress(),
      signer
    );
  }
}
