import { expect } from "chai";
import { getProvider } from "../providers-builder";

describe("Providers builder", () => {
    it("throws an error if trying to fetch a provider for an unsupported chain", async () => {
        expect(() => getProvider("666")).to.be.throw("Chain 666 does not seem to be supported");
    });

    it("returns a valid provider for supported chains", async () => {
        const p = getProvider("42");
        expect(p).to.not.be.null;
        expect(p._isProvider).to.be.true;
    });
});
