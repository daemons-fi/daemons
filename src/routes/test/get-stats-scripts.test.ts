import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import supertest from "supertest";
import { app } from "../../app";
import { IScriptStats, scriptStatsDocumentFactory } from "@daemons-fi/db-schema";
import { expect } from "chai";

describe("GET /api/stats/scripts/:chainId", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it("returns an empty array if there are no stats on the db", async () => {
        const chainId = "42";
        const response = await supertest(app).get(`/api/stats/scripts/${chainId}`);

        const fetchedScripts = response.body as IScriptStats[];
        expect(fetchedScripts.length).to.equal(0);
    });

    it("only fetches stats relative to the specified chain", async () => {
        // add a few stats
        await scriptStatsDocumentFactory({ chainId: "42" });
        await scriptStatsDocumentFactory({ chainId: "42" });
        await scriptStatsDocumentFactory({ chainId: "42" });

        // and another couple from another chain
        await scriptStatsDocumentFactory({ chainId: "1" });
        await scriptStatsDocumentFactory({ chainId: "2" });

        const chainId = "42";
        const response = await supertest(app).get(`/api/stats/scripts/${chainId}`);

        const fetchedStats = response.body as IScriptStats[];
        expect(fetchedStats.length).to.equal(3);
    });

    it("response has cache-control headers", async () => {
        await scriptStatsDocumentFactory({ chainId: "42" });

        const chainId = "42";
        const response = await supertest(app).get(`/api/stats/scripts/${chainId}`);

        expect(response.headers["cache-control"]).to.not.equal(undefined);
    });
});
