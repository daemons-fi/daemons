import { expect } from "chai";
import { parseScript } from "../script-builder";
import chai from "chai";
import { signedTransferActionFactory } from "../../../test-factories/script-factories";
chai.use(require("chai-as-promised"));

describe("Script builder", () => {
    it("throws an error if trying to build a script from an unsupported type", async () => {
        const script = { __type: "YourMum" };
        const gonnaThrowPromise = () => parseScript(script);

        await expect(gonnaThrowPromise()).to.be.rejectedWith("Unsupported script type: YourMum");
    });

    it("returns a valid script", async () => {
        const transferScript = signedTransferActionFactory({});
        const parsedScript = await parseScript(transferScript);

        expect(transferScript.__type).to.be.equal(parsedScript.ScriptType);
    });
});
