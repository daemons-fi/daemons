import { swapScriptDocumentFactory, Transaction, transactionDocumentFactory } from "@daemons-fi/db-schema";
import { expect } from "chai";
import { clearTestDb, closeTestDb, connectToTestDb } from "../../test/test-db-handler";
import { buildTxFromEvent } from "../build-tx-from-event";

const sinon = require("sinon");
const TxCostsAndProfits = require("../get-tx-cost-and-profits");

describe("Transaction.buildFromEvent", () => {
    before(async () => await connectToTestDb());
    beforeEach(async () => {
        // mock TxCostsAndProfits so to avoid tons of blockchain calls
        const fakeCostsAndProfits = { costDAEM: 0.25, costETH: 0.0001, profitDAEM: 0.5}
        sinon.stub(TxCostsAndProfits, "getTxCostsAndProfits").returns(fakeCostsAndProfits);
    });
    afterEach(async () => {
        await clearTestDb();
        sinon.restore();
    });
    after(async () => await closeTestDb());

    const userAddress = "0xb79f76ef2c5f0286176833e7b2eee103b1cc3244";
    const otherUserAddress = "0x6be2ae72634f9326c74a9f2cc0201edbeda7cd0c";

    const fakeEvent = (txHash: string = "0xBACCA") =>
        ({
            transactionHash: txHash,
            getBlock: () => {
                Promise.resolve({ timestamp: Math.floor(Date.now() / 1000) });
            }
        } as any);

    it("No tx is created if the executor and beneficiary are the same", async () => {
        const script = await swapScriptDocumentFactory({});
        const result = await buildTxFromEvent(
            script.scriptId,
            userAddress,
            userAddress,
            fakeEvent()
        );
        expect(result).to.equal(undefined);

        const countTxs = await Transaction.countDocuments({});
        expect(countTxs).to.equal(0);
    });

    it("No tx is created if the hash already exists", async () => {
        const tx = await transactionDocumentFactory({});

        const script = await swapScriptDocumentFactory({});
        const result = await buildTxFromEvent(
            script.scriptId,
            userAddress,
            otherUserAddress,
            fakeEvent(tx.hash)
        );
        expect(result).to.equal(undefined);

        // only the already-added tx should be there
        const countTxs = await Transaction.countDocuments({});
        expect(countTxs).to.equal(1);
    });

    it("No tx is created if the script cannot be found", async () => {
        const result = await buildTxFromEvent(
            "0x00",
            userAddress,
            otherUserAddress,
            fakeEvent()
        );
        expect(result).to.equal(undefined);

        const countTxs = await Transaction.countDocuments({});
        expect(countTxs).to.equal(0);
    });

    it("tx happy flow", async () => {
        const script = await swapScriptDocumentFactory({});
        const result = await buildTxFromEvent(
            script.scriptId,
            userAddress,
            otherUserAddress,
            fakeEvent()
        );
        expect(result).to.not.be.undefined;

        const countTxs = await Transaction.countDocuments({});
        expect(countTxs).to.equal(1);

        const tx = await Transaction.findOne({});
        expect(tx!.hash).to.equal(result!.hash);
        expect(tx!.scriptId).to.equal(result!.scriptId);
        expect(tx!.scriptType).to.equal(result!.scriptType);
        expect(tx!.chainId).to.equal(result!.chainId);
        expect(tx!.description).to.equal(result!.description);
        expect(tx!.executingUser).to.equal(result!.executingUser);
        expect(tx!.beneficiaryUser).to.equal(result!.beneficiaryUser);
        expect((tx!.date as Date).toISOString()).to.equal((result!.date as Date).toISOString());
        expect(tx!.costEth).to.equal(result!.costEth);
        expect(tx!.costDAEM).to.equal(result!.costDAEM);
        expect(tx!.profitDAEM).to.equal(result!.profitDAEM);
    });
});
