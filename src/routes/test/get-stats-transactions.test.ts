import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import supertest from "supertest";
import { app } from "../../app";
import { ITransactionStats, transactionStatsDocumentFactory } from "@daemons-fi/db-schema";
import { expect } from "chai";

describe("GET /api/stats/transactions/:chainId", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it("returns an empty array if there are no stats on the db", async () => {
        const chainId = "42";
        const response = await supertest(app).get(`/api/stats/transactions/${chainId}`);

        const fetchedScripts = response.body as ITransactionStats[];
        expect(fetchedScripts.length).to.equal(0);
    });

    it("only fetches stats relative to the specified chain", async () => {
        // add a few stats
        await transactionStatsDocumentFactory({ chainId: "42" });
        await transactionStatsDocumentFactory({ chainId: "42" });
        await transactionStatsDocumentFactory({ chainId: "42" });

        // and another couple from another chain
        await transactionStatsDocumentFactory({ chainId: "1" });
        await transactionStatsDocumentFactory({ chainId: "2" });

        const chainId = "42";
        const response = await supertest(app).get(`/api/stats/transactions/${chainId}`);

        const fetchedStats = response.body as ITransactionStats[];
        expect(fetchedStats.length).to.equal(3);
    });

    it("response has cache-control headers", async () => {
        await transactionStatsDocumentFactory({ chainId: "42" });

        const chainId = "42";
        const response = await supertest(app).get(`/api/stats/transactions/${chainId}`);

        expect(response.headers["cache-control"]).to.not.equal(undefined);
    });
});
