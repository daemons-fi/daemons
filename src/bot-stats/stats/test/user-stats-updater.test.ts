import { expect } from "chai";
import { transferScriptDocumentFactory, UserStats } from "@daemons-fi/db-schema";
import { mmBaseScriptDocumentFactory } from "@daemons-fi/db-schema";
import { swapScriptDocumentFactory } from "@daemons-fi/db-schema";
import { connectToTestDb, closeTestDb, clearTestDb } from "../../../test/test-db-handler";
import { updateUserStats } from "../user-stats-updater";
import Sinon from "sinon";
const providersBuilder = require("../../../utils/providers-builder");

describe("User Stats Updater", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => {
        Sinon.restore();
        await clearTestDb();
    });
    after(async () => await closeTestDb());

    const userAddress1 = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const userAddress2 = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3200';

    it("successfully saves the stats for a single chain", async () => {
        await swapScriptDocumentFactory({ chainId: "42", user: userAddress1 });
        await swapScriptDocumentFactory({ chainId: "42", user: userAddress2 });
        await transferScriptDocumentFactory({ chainId: "42", user: userAddress1 });
        await mmBaseScriptDocumentFactory({ chainId: "42", user: userAddress2 });

        Sinon.stub(providersBuilder, "supportedChainsList").returns(["42", "80001"]);
        await updateUserStats();

        // expected 1 stat: {amount: 4, chain: Kovan}
        expect(await UserStats.count()).to.equal(1);
        expect((await UserStats.findOne({}))!.amount).to.equal(2);
        expect((await UserStats.findOne({}))!.chainId).to.equal('42');
    });

    it("successfully saves the stats for a multiple chains", async () => {
        await swapScriptDocumentFactory({ chainId: "42", user: userAddress1 });
        await swapScriptDocumentFactory({ chainId: "42", user: userAddress2 });
        await transferScriptDocumentFactory({ chainId: "80001", user: userAddress1 });
        await mmBaseScriptDocumentFactory({ chainId: "42", user: userAddress2 });

        Sinon.stub(providersBuilder, "supportedChainsList").returns(["42", "80001"]);
        await updateUserStats();

        // we got 2 stats: {amount: 2, chain: Kovan}, {amount 1, chain Ethereum}
        expect(await UserStats.count()).to.equal(2);
        expect((await UserStats.findOne({chainId: '42'}))!.amount).to.equal(2);
        expect((await UserStats.findOne({chainId: '80001'}))!.amount).to.equal(1);
    });

    it("data belonging to the same day is updated", async () => {
        await swapScriptDocumentFactory({ chainId: "42" });
        await swapScriptDocumentFactory({ chainId: "42" });
        await transferScriptDocumentFactory({ chainId: "42" });
        await mmBaseScriptDocumentFactory({ chainId: "42" });

        Sinon.stub(providersBuilder, "supportedChainsList").returns(["42", "80001"]);
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
