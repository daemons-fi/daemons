import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, ethers } from "ethers";
import { BaseScript } from "./base-script";
import { BalanceFactory } from "../condition-base-factories/balance-factory";
import { FrequencyFactory } from "../condition-base-factories/frequency-factory";
import { PriceFactory } from "../condition-base-factories/price-factory";
import { RepetitionsFactory } from "../condition-base-factories/repetitions-factory";
import { FollowFactory } from "../condition-base-factories/follow-factory";
import { IZapOutAction } from "@daemons-fi/shared-definitions/build";
import { UniswapV2FactoryABI, UniswapV2RouterABI, zapOutScriptAbi } from "@daemons-fi/abis";
import { AllowanceHelper } from "../allowance-helper";

export class ZapOutScript extends BaseScript {
    public constructor(
        private readonly message: IZapOutAction,
        signature: string,
        private readonly description: string
    ) {
        super(signature);
    }

    private cachedLPAddress: string | undefined;
    public readonly ScriptType = "ZapOutScript";
    public getExecutorAddress = () => this.message.executor;
    public getExecutorAbi = () => zapOutScriptAbi;
    public getMessage = () => this.message;
    public getId = () => this.message.scriptId;
    public getUser = () => this.message.user;
    public getDescription = () => this.description;
    protected getAmount = () => this.message.amount;
    protected getTokenForAllowance = () => {
        throw new Error("This method should not be used");
    };

    public static async fromStorageJson(object: any) {
        const message: IZapOutAction = JSON.parse(JSON.stringify(object));

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.chainId);
        message.amount = BigNumber.from(object.amount);
        message.tip = BigNumber.from(object.tip);

        message.balance = BalanceFactory.fromJson(message.balance);
        message.frequency = FrequencyFactory.fromJson(message.frequency);
        message.price = PriceFactory.fromJson(message.price);
        message.repetitions = RepetitionsFactory.fromJson(message.repetitions);
        message.follow = FollowFactory.fromJson(object.follow);

        return new ZapOutScript(message, object.signature, object.description);
    }

    // Override parent hasAllowance, as we need the LP rather than the token.
    public async hasAllowance(
        signerOrProvider: ethers.providers.Provider | ethers.Signer
    ): Promise<boolean> {
        const lpAddress = await this.getLPAddress(signerOrProvider);
        return await AllowanceHelper.checkForERC20Allowance(
            this.getUser(),
            lpAddress,
            this.getExecutorAddress(),
            this.getAmount(),
            signerOrProvider
        );
    }

    // Override parent hasAllowance, as we need the LP rather than the token.
    public async requestAllowance(signer: ethers.Signer): Promise<TransactionResponse> {
        const lpAddress = await this.getLPAddress(signer);
        return await AllowanceHelper.requestAAVEDebtTokenAllowance(
            lpAddress,
            this.getExecutorAddress(),
            signer
        );
    }

    private async getLPAddress(
      signerOrProvider: ethers.providers.Provider | ethers.Signer
  ): Promise<string> {
      if (this.cachedLPAddress) return this.cachedLPAddress;

      // get UniswapV2 Router
      const uniswapRouterAddress = this.message.kontract;
      const uniswapV2Router = new ethers.Contract(
          uniswapRouterAddress,
          UniswapV2RouterABI,
          signerOrProvider
      );
      // get UniswapV2 Factory
      const uniswapFactoryAddress = await uniswapV2Router.factory();
      const uniswapV2Factory = new ethers.Contract(
          uniswapFactoryAddress,
          UniswapV2FactoryABI,
          signerOrProvider
      );

      this.cachedLPAddress = await uniswapV2Factory.getPair(
          this.message.tokenA,
          this.message.tokenB
      );
      return this.cachedLPAddress!;
  }
}
