import { expect } from "chai";
import { ScriptStats } from "@daemons-fi/db-schema";
import { mmBaseScriptDocumentFactory } from "@daemons-fi/db-schema";
import { transferScriptDocumentFactory } from "@daemons-fi/db-schema";
import { swapScriptDocumentFactory } from "@daemons-fi/db-schema";
import { connectToTestDb, closeTestDb, clearTestDb } from "../../../test/test-db-handler";
import { updateScriptStats } from "../script-stats-updater";

describe("Script Stats Updater", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it("successfully saves the stats for a single chain", async () => {
        await swapScriptDocumentFactory({ chainId: "42" });
        await swapScriptDocumentFactory({ chainId: "42" });
        await transferScriptDocumentFactory({ chainId: "42" });
        await mmBaseScriptDocumentFactory({ chainId: "42" });

        await updateScriptStats();

        // we got 3 stats, one for each script kind (3), chain (1) and date (1)
        // 2 Swap, 1 Transfer, 1 MmBase
        expect(await ScriptStats.count()).to.equal(3);
        expect(await ScriptStats.count({ kind: "Swap" })).to.equal(1);
        expect((await ScriptStats.find({ kind: "Swap" }))[0].amount).to.equal(2);
        expect(await ScriptStats.count({ kind: "Transfer" })).to.equal(1);
        expect((await ScriptStats.find({ kind: "Transfer" }))[0].amount).to.equal(1);
        expect(await ScriptStats.count({ kind: "MmBase" })).to.equal(1);
        expect((await ScriptStats.find({ kind: "MmBase" }))[0].amount).to.equal(1);
    });

    it("successfully saves the stats for a multiple chains", async () => {
        await swapScriptDocumentFactory({ chainId: "42" });
        await swapScriptDocumentFactory({ chainId: "4002" });
        await transferScriptDocumentFactory({ chainId: "80001" });
        await mmBaseScriptDocumentFactory({ chainId: "42" });

        await updateScriptStats();

        // we got 4 stats, one for each script kind (3), chain (3) and date (1)
        // 1 Swap on 42, 1 Swap on 15, 1 Transfer on 0, 1 MmBase on 42
        // 0-amount stats are not saved
        expect(await ScriptStats.count()).to.equal(4);
        expect(await ScriptStats.count({ kind: "Swap" })).to.equal(2);
        expect((await ScriptStats.find({ kind: "Swap", chainId: "42" }))[0].amount).to.equal(1);
        expect((await ScriptStats.find({ kind: "Swap", chainId: "4002" }))[0].amount).to.equal(1);
        expect(await ScriptStats.count({ kind: "Transfer" })).to.equal(1);
        expect((await ScriptStats.find({ kind: "Transfer" }))[0].amount).to.equal(1);
        expect((await ScriptStats.find({ kind: "Transfer" }))[0].chainId).to.equal("80001");
        expect(await ScriptStats.count({ kind: "MmBase" })).to.equal(1);
        expect((await ScriptStats.find({ kind: "MmBase" }))[0].amount).to.equal(1);
        expect((await ScriptStats.find({ kind: "MmBase" }))[0].chainId).to.equal("42");
    });

    it("data belonging to the same day is updated", async () => {
        await swapScriptDocumentFactory({ chainId: "42" });
        await swapScriptDocumentFactory({ chainId: "42" });
        await transferScriptDocumentFactory({ chainId: "42" });

        await updateScriptStats();

        // expected 2: [Swap, count 2] + [Transfer count 1]
        expect(await ScriptStats.count()).to.equal(2);
        expect((await ScriptStats.find({ kind: "Swap" }))[0].amount).to.equal(2);
        expect((await ScriptStats.find({ kind: "Transfer" }))[0].amount).to.equal(1);

        // more scripts are added and the stats are recalculated
        await swapScriptDocumentFactory({ chainId: "42" });
        await transferScriptDocumentFactory({ chainId: "42" });

        await updateScriptStats();

        // expected 2: [Swap, count 3] + [Transfer count 2]
        expect(await ScriptStats.count()).to.equal(2);
        expect((await ScriptStats.find({ kind: "Swap" }))[0].amount).to.equal(3);
        expect((await ScriptStats.find({ kind: "Transfer" }))[0].amount).to.equal(2);
    });
});
