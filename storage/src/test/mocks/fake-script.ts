import { BaseScript, ScriptVerification } from "@daemons-fi/scripts-definitions";
import { BigNumber, ethers } from "ethers";

export class FakeScript extends BaseScript {
    public readonly ScriptType = "FakeScript";

    public constructor(private readonly fakeVerification: ScriptVerification) {
        super(
            "0x17a00a8e7eb887db98418592f518310682dbd329fefd7e9039309f4e3654cbbe51eedbbef42b5b1940e019fd57665fe5dae863890c354d9198d0bf46cd2892541c"
        );
    }

    public getExecutorAddress = () => "0x0Y0L0";
    public getExecutorAbi = () => [];
    public getMessage = () => ({ chainId: "42" });
    public getId = () => "0x0Y0L0";
    public getUser = () => "0x0Y0L0";
    public getDescription = () => "0x0Y0L0";
    protected getAmount = () => BigNumber.from(0);
    protected getTokenForAllowance = () => "0x0Y0L0";

    public verify = (signerOrProvider: ethers.providers.Provider | ethers.Signer) =>
        Promise.resolve(this.fakeVerification);

    // None of these methods should be required

    public getVerification = () => {
        throw new Error("Should not be required");
    };

    public execute = (signer: ethers.Signer) => {
        throw new Error("Should not be required");
    };

    public revoke = (signer: ethers.Signer) => {
        throw new Error("Should not be required");
    };

    public hasAllowance = (signerOrProvider: ethers.providers.Provider | ethers.Signer) => {
        throw new Error("Should not be required");
    };

    public requestAllowance = (signer: ethers.Signer) => {
        throw new Error("Should not be required");
    };
}
