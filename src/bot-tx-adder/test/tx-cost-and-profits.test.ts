import { clearTestDb, closeTestDb, connectToTestDb } from "../../test/test-db-handler";
import { expect } from "chai";
import { getTxCostsAndProfits } from "../get-tx-cost-and-profits";
import { BigNumber, utils } from "ethers";
import { getGasLimitForScript } from "@daemons-fi/scripts-definitions/build";
import { swapScriptDocumentFactory } from "@daemons-fi/db-schema/build";
import { bigNumberToFloat } from "../../utils/big-number-to-float";
const sinon = require("sinon");
const GasPriceRetriever = require("../../utils/gas-price-retriever");
const DAEMPriceRetriever = require("../../utils/daem-price-retriever");

describe("getTxCostsAndProfits", () => {
    const fakeGasPrice = BigNumber.from(2500000007);
    const fakeDAEMPrice = BigNumber.from(1000000000000000); // 1 DAEM === 0.001 ETH

    before(async () => await connectToTestDb());
    beforeEach(async () => {
        // mock classes so to avoid tons of blockchain calls
        sinon.stub(GasPriceRetriever, "fetchGasPriceWithCache").returns(fakeGasPrice);
        sinon.stub(DAEMPriceRetriever, "fetchDAEMPriceInETHWithCache").returns(fakeDAEMPrice);
    });
    afterEach(async () => {
        await clearTestDb();
        sinon.restore();
    });
    after(async () => await closeTestDb());

    it("CostDAEM is taken directly from the script", async () => {
        const script = await swapScriptDocumentFactory({});
        const scriptTip = bigNumberToFloat(BigNumber.from(script.tip.toString()));

        const costsAndProfits = await getTxCostsAndProfits(script);
        expect(costsAndProfits.costDAEM).to.equal(scriptTip);
    });

    it("costETH depends on script execution cost and and current gas price", async () => {
        const script = await swapScriptDocumentFactory({});
        const scriptExecutionCost = getGasLimitForScript((script as any).__type);
        const gasPrice = fakeGasPrice;
        const expectedCostETH = scriptExecutionCost.mul(gasPrice);

        const costsAndProfits = await getTxCostsAndProfits(script);
        expect(costsAndProfits.costETH).to.equal(bigNumberToFloat(expectedCostETH, 5));
    });

    it("profitDAEM is calculated using costDAEM and costETH", async () => {
        const script = await swapScriptDocumentFactory({});

        const scriptTip = BigNumber.from(script.tip.toString());
        const tipWithoutTaxes = scriptTip.mul(8).div(10);

        const scriptExecutionCost = getGasLimitForScript((script as any).__type);
        const gasPrice = fakeGasPrice;
        const expectedCostETH = scriptExecutionCost.mul(gasPrice);
        const ethToDaem = bigNumberToFloat(expectedCostETH, 6) / bigNumberToFloat(fakeDAEMPrice, 6);

        const expectedProfitDAEM = tipWithoutTaxes.add(utils.parseEther(ethToDaem.toString()));

        const costsAndProfits = await getTxCostsAndProfits(script);
        expect(costsAndProfits.profitDAEM).to.equal(bigNumberToFloat(expectedProfitDAEM));
    });
});
