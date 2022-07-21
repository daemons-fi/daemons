import { expect } from "chai";
import { utils } from "ethers";
import itParam from "mocha-param";
import { bigNumberToFloat } from "../big-number-to-float";

interface paramData {
    input: string;
    decimals: number;
    output: number;
}

describe("bigNumberToFloat", () => {
    itParam(
        "gets a float from a 18 digits big number: ${JSON.stringify(value)}",
        [
            { input: "3.14159265359", decimals: 0, output: 3 },
            { input: "3.14159265359", decimals: 1, output: 3.1 },
            { input: "3.14159265359", decimals: 4, output: 3.1415 },
            { input: "3.14159265359", decimals: 6, output: 3.141592 },
            { input: "3.141", decimals: 4, output: 3.141 },
            { input: "3", decimals: 4, output: 3 },
        ],
        async ({ input, decimals, output }: paramData) => {
            const bigNumber = utils.parseEther(input);
            const result = bigNumberToFloat(bigNumber, decimals);
            expect(result).to.equal(output);
        }
    );

    it("correctly handles big numbers with a different number of decimals", async () => {
        const inputDecimals = 6;
        const outputDecimals = 4;
        const bigNumber = utils.parseUnits("3.141592", inputDecimals);

        const result = bigNumberToFloat(bigNumber, outputDecimals, inputDecimals);

        expect(result).to.equal(3.1415);
    });
});
