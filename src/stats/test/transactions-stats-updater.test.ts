import { expect } from "chai";
import { TransactionStats } from "../../models/stats/transaction-stats";
import { transactionDocumentFactory } from "../../test-factories/transactions-factories";
import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import { updateTransactionStats } from "../transactions-stats-updater";
const sinon = require("sinon");
const statsUpdater = require("..");

describe("Transactions Stats Updater", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => {
        await clearTestDb();
        sinon.restore();
    });
    after(async () => await closeTestDb());

    it("successfully saves the stats for a single chain", async () => {
        await transactionDocumentFactory({ chainId: "42", scriptType: "Swap" });
        await transactionDocumentFactory({ chainId: "42", scriptType: "Swap" });
        await transactionDocumentFactory({ chainId: "42", scriptType: "Transfer" });
        await transactionDocumentFactory({ chainId: "42", scriptType: "MmBase" });

        await updateTransactionStats();

        // we got 3 stats, one for each script kind (3), chain (1) and date (1)
        // 2 Swap, 1 Transfer, 1 MmBase
        expect(await TransactionStats.count()).to.equal(3);
        expect(await TransactionStats.count({ kind: "Swap" })).to.equal(1);
        expect((await TransactionStats.find({ kind: "Swap" }))[0].amount).to.equal(2);
        expect(await TransactionStats.count({ kind: "Transfer" })).to.equal(1);
        expect((await TransactionStats.find({ kind: "Transfer" }))[0].amount).to.equal(1);
        expect(await TransactionStats.count({ kind: "MmBase" })).to.equal(1);
        expect((await TransactionStats.find({ kind: "MmBase" }))[0].amount).to.equal(1);
    });

    it("successfully saves the stats for a multiple chains", async () => {
        // add multiple chains to the ChainInfo dictionary
        sinon.stub(statsUpdater, "ChainInfo").returns({
            "42": "Kovan",
            "0": "Ethereum",
            "15": "WhoKnows"
        });

        await transactionDocumentFactory({ chainId: "42", scriptType: "Swap" });
        await transactionDocumentFactory({ chainId: "15", scriptType: "Swap" });
        await transactionDocumentFactory({ chainId: "0", scriptType: "Transfer" });
        await transactionDocumentFactory({ chainId: "42", scriptType: "MmBase" });

        await updateTransactionStats();

        // we got 4 stats, one for each script kind (3), chain (3) and date (1)
        // 1 Swap on 42, 1 Swap on 15, 1 Transfer on 0, 1 MmBase on 42
        // 0-amount stats are not saved
        expect(await TransactionStats.count()).to.equal(4);
        expect(await TransactionStats.count({ kind: "Swap" })).to.equal(2);
        expect((await TransactionStats.find({ kind: "Swap", chain: "Kovan" }))[0].amount).to.equal(
            1
        );
        expect(
            (await TransactionStats.find({ kind: "Swap", chain: "WhoKnows" }))[0].amount
        ).to.equal(1);
        expect(await TransactionStats.count({ kind: "Transfer" })).to.equal(1);
        expect((await TransactionStats.find({ kind: "Transfer" }))[0].amount).to.equal(1);
        expect((await TransactionStats.find({ kind: "Transfer" }))[0].chain).to.equal("Ethereum");
        expect(await TransactionStats.count({ kind: "MmBase" })).to.equal(1);
        expect((await TransactionStats.find({ kind: "MmBase" }))[0].amount).to.equal(1);
        expect((await TransactionStats.find({ kind: "MmBase" }))[0].chain).to.equal("Kovan");
    });

    it("data belonging to the same day is updated", async () => {
        await transactionDocumentFactory({ chainId: "42", scriptType: "Swap" });
        await transactionDocumentFactory({ chainId: "42", scriptType: "Swap" });
        await transactionDocumentFactory({ chainId: "42", scriptType: "Transfer" });

        await updateTransactionStats();

        // expected 2: [Swap, count 2] + [Transfer count 1]
        expect(await TransactionStats.count()).to.equal(2);
        expect((await TransactionStats.find({ kind: "Swap" }))[0].amount).to.equal(2);
        expect((await TransactionStats.find({ kind: "Transfer" }))[0].amount).to.equal(1);

        // more scripts are added and the stats are recalculated
        await transactionDocumentFactory({ chainId: "42", scriptType: "Swap" });
        await transactionDocumentFactory({ chainId: "42", scriptType: "Transfer" });

        await updateTransactionStats();

        // expected 2: [Swap, count 3] + [Transfer count 2]
        expect(await TransactionStats.count()).to.equal(2);
        expect((await TransactionStats.find({ kind: "Swap" }))[0].amount).to.equal(3);
        expect((await TransactionStats.find({ kind: "Transfer" }))[0].amount).to.equal(2);
    });
});
