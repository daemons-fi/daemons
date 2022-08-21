import { expect } from "chai";
import { TransactionStats } from "@daemons-fi/db-schema";
import { transactionDocumentFactory } from "@daemons-fi/db-schema";
import { connectToTestDb, closeTestDb, clearTestDb } from "../../../test/test-db-handler";
import { updateTransactionStats } from "../transactions-stats-updater";

describe("Transactions Stats Updater", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
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
        await transactionDocumentFactory({ chainId: "42", scriptType: "Swap" });
        await transactionDocumentFactory({ chainId: "42", scriptType: "Swap" });
        await transactionDocumentFactory({ chainId: "80001", scriptType: "Transfer" });
        await transactionDocumentFactory({ chainId: "42", scriptType: "MmBase" });

        await updateTransactionStats();

        // we got 3 stats, one for each script kind (3), chain (2) and date (1)
        // 2 Swaps on 42, 1 Transfer on 80001, 1 MmBase on 42
        // 0-amount stats are not saved
        expect(await TransactionStats.count()).to.equal(3);
        expect(await TransactionStats.count({ kind: "Swap" })).to.equal(1);
        expect((await TransactionStats.find({ kind: "Swap" }))[0].amount).to.equal(2);
        expect((await TransactionStats.find({ kind: "Swap" }))[0].chainId).to.equal("42");
        expect(await TransactionStats.count({ kind: "Transfer" })).to.equal(1);
        expect((await TransactionStats.find({ kind: "Transfer" }))[0].amount).to.equal(1);
        expect((await TransactionStats.find({ kind: "Transfer" }))[0].chainId).to.equal("80001");
        expect(await TransactionStats.count({ kind: "MmBase" })).to.equal(1);
        expect((await TransactionStats.find({ kind: "MmBase" }))[0].amount).to.equal(1);
        expect((await TransactionStats.find({ kind: "MmBase" }))[0].chainId).to.equal("42");
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
