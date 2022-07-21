import supertest from "supertest";
import { app } from "../../app";
import { expect } from "chai";
import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import { ITreasuryStats, TreasuryStats } from "../../models/stats/treasury-stats";

describe("POST api/admin/treasury-stats", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const treasuryStat: ITreasuryStats = {
        date: "2021-01-01", // old date that will be overwritten anyway
        apr: 125,
        treasury: 15884,
        staked: 123,
        pol: 1552,
        distributed: 1215,
        chain: "42"
    };

    it("fails if user is not authenticated", async () => {
        await supertest(app).post("/api/admin/treasury-stats").send([treasuryStat]).expect(401);

        const stats = await TreasuryStats.findOne({});
        expect(stats).to.be.null;
    });

    it("successfully adds a treasury stat", async () => {
        await supertest(app)
            .post("/api/admin/treasury-stats")
            .send([treasuryStat])
            .set({ api_key: process.env.ADMIN_KEY })
            .expect(200);

        const stats = await TreasuryStats.findOne({});
        expect(stats).to.not.be.null;
        expect(stats!.apr).to.equal(treasuryStat.apr);
        expect(stats!.treasury).to.equal(treasuryStat.treasury);
        expect(stats!.staked).to.equal(treasuryStat.staked);
        expect(stats!.pol).to.equal(treasuryStat.pol);
        expect(stats!.distributed).to.equal(treasuryStat.distributed);
        expect(stats!.chain).to.equal(treasuryStat.chain);
    });

    it("date is always overwritten", async () => {
        await supertest(app)
            .post("/api/admin/treasury-stats")
            .send([treasuryStat])
            .set({ api_key: process.env.ADMIN_KEY })
            .expect(200);

        const expectedDate = new Date().toISOString().substring(0, 10);
        const stats = await TreasuryStats.findOne({});
        expect(stats).to.not.be.null;
        expect(stats!.date).to.equal(expectedDate);
    });

    it("deletes previously added statistics", async () => {
        await supertest(app)
            .post("/api/admin/treasury-stats")
            .send([treasuryStat])
            .set({ api_key: process.env.ADMIN_KEY })
            .expect(200);

        const modifiedStat = JSON.parse(JSON.stringify(treasuryStat));
        modifiedStat.apr = 0;

        await supertest(app)
            .post("/api/admin/treasury-stats")
            .send([modifiedStat])
            .set({ api_key: process.env.ADMIN_KEY })
            .expect(200);

        const stats = await TreasuryStats.find({});
        expect(stats.length).to.equal(1);
        expect(stats[0].apr).to.equal(modifiedStat.apr);
    });
});
