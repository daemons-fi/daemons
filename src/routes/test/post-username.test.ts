import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import supertest from "supertest";
import { app } from "../../app";
import { User, userDocumentFactory } from "@daemons-fi/db-schema";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

describe("POST api/profile/username", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = ethers.utils.getAddress("0xb79f76ef2c5f0286176833e7b2eee103b1cc3244");
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it("successfully updates username", async () => {
        await userDocumentFactory({ address: userAddress, username: "0xYOLO" });
        const payload = { username: "0xWAGMI" };

        await supertest(app)
            .post("/api/profile/username")
            .set("Cookie", `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const user = await User.findOne({ address: userAddress });
        expect(user).to.not.be.null;
        expect(user!.username).to.equal("0xWAGMI");
    });

    it("returns a 401 error if an unauthenticated user tries to update a description", async () => {
        await userDocumentFactory({ address: userAddress, username: "0xYOLO" });
        const payload = { username: "0xWAGMI" };

        await supertest(app).post("/api/profile/username").send(payload).expect(401);

        // username is unchanged
        const user = await User.findOne({ address: userAddress });
        expect(user).to.not.be.null;
        expect(user!.username).to.equal("0xYOLO");
    });

    it("returns a 400 error if username is already in use", async () => {
        await userDocumentFactory({ username: "0xWAGMI" });
        await userDocumentFactory({ address: userAddress, username: "0xYOLO" });
        const payload = { username: "0xWAGMI" };

        await supertest(app)
            .post("/api/profile/username")
            .set("Cookie", `token=${jwToken}`)
            .send(payload)
            .expect(400)
            .expect((res) => expect(res.text).to.equal("Username not available"));

        // username is unchanged
        const user = await User.findOne({ address: userAddress });
        expect(user).to.not.be.null;
        expect(user!.username).to.equal("0xYOLO");
    });

    it("returns a 400 error if username is already in use (case insensitive)", async () => {
        await userDocumentFactory({ username: "0xWaGmI" });
        await userDocumentFactory({ address: userAddress, username: "0xYOLO" });
        const payload = { username: "0xWAGMI" };

        await supertest(app)
            .post("/api/profile/username")
            .set("Cookie", `token=${jwToken}`)
            .send(payload)
            .expect(400)
            .expect((res) => expect(res.text).to.equal("Username not available"));

        // username is unchanged
        const user = await User.findOne({ address: userAddress });
        expect(user).to.not.be.null;
        expect(user!.username).to.equal("0xYOLO");
    });
});
