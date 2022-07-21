import { expect } from "chai";
import { UserStats } from "../../models/stats/user-stats";
import { mmBaseScriptDocumentFactory } from "../../test-factories/script-factories";
import { transferScriptDocumentFactory } from "../../test-factories/script-factories";
import { swapScriptDocumentFactory } from "../../test-factories/script-factories";
import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import { updateScriptStats } from "../script-stats-updater";
import { updateUserStats } from "../user-stats-updater";
const sinon = require("sinon");
const statsUpdater = require("..");

describe("User Stats Updater", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => {
        await clearTestDb();
        sinon.restore();
    });
    after(async () => await closeTestDb());

    const userAddress1 = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const userAddress2 = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3200';

    it("successfully saves the stats for a single chain", async () => {
        await swapScriptDocumentFactory({ chainId: "42", user: userAddress1 });
        await swapScriptDocumentFactory({ chainId: "42", user: userAddress2 });
        await transferScriptDocumentFactory({ chainId: "42", user: userAddress1 });
        await mmBaseScriptDocumentFactory({ chainId: "42", user: userAddress2 });

        await updateUserStats();

        // expected 1 stat: {amount: 4, chain: Kovan}
        expect(await UserStats.count()).to.equal(1);
        expect((await UserStats.findOne({}))!.amount).to.equal(2);
        expect((await UserStats.findOne({}))!.chain).to.equal('Kovan');
    });

    it("successfully saves the stats for a multiple chains", async () => {
        // add multiple chains to the ChainInfo dictionary
        sinon.stub(statsUpdater, "ChainInfo").returns({
            "42": "Kovan",
            "0": "Ethereum",
            "15": "WhoKnows"
        });

        await swapScriptDocumentFactory({ chainId: "42", user: userAddress1 });
        await swapScriptDocumentFactory({ chainId: "42", user: userAddress2 });
        await transferScriptDocumentFactory({ chainId: "0", user: userAddress1 });
        await mmBaseScriptDocumentFactory({ chainId: "42", user: userAddress2 });

        await updateUserStats();

        // we got 2 stats: {amount: 2, chain: Kovan}, {amount 1, chain Ethereum}
        expect(await UserStats.count()).to.equal(2);
        expect((await UserStats.findOne({chain: 'Kovan'}))!.amount).to.equal(2);
        expect((await UserStats.findOne({chain: 'Ethereum'}))!.amount).to.equal(1);
    });

    it("data belonging to the same day is updated", async () => {
        await swapScriptDocumentFactory({ chainId: "42" });
        await swapScriptDocumentFactory({ chainId: "42" });
        await transferScriptDocumentFactory({ chainId: "42" });
        await mmBaseScriptDocumentFactory({ chainId: "42" });

        await updateUserStats();

        // expected 1 stat: {amount: 4, chain: Kovan}
        expect(await UserStats.count()).to.equal(1);
        expect((await UserStats.findOne({}))!.amount).to.equal(4);

        // more scripts are added and the stats are recalculated
        await swapScriptDocumentFactory({ chainId: "42" });
        await transferScriptDocumentFactory({ chainId: "42" });

        await updateUserStats();

        // expected 1 stat: {amount: 6, chain: Kovan}
        expect(await UserStats.count()).to.equal(1);
        expect((await UserStats.findOne({}))!.amount).to.equal(6);
    });
});
