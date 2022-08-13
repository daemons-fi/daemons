import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import supertest from "supertest";
import { app } from "../../app";
import { User, userDocumentFactory } from "@daemons-fi/db-schema";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

describe("POST api/profile/show-tutorial-tooltip", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = ethers.utils.getAddress("0xb79f76ef2c5f0286176833e7b2eee103b1cc3244");
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it("successfully updates tutorial-tooltip", async () => {
        await userDocumentFactory({ address: userAddress, showTutorial: false });
        const payload = { value: true };

        await supertest(app)
            .post("/api/profile/show-tutorial-tooltip")
            .set("Cookie", `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const user = await User.findOne({ address: userAddress });
        expect(user).to.not.be.null;
        expect(user!.showTutorial).to.equal(true);
    });

    it("returns a 401 error if an unauthenticated user tries to update a description", async () => {
        await userDocumentFactory({ address: userAddress, showTutorial: false });
        const payload = { value: true };

        await supertest(app).post("/api/profile/show-tutorial-tooltip").send(payload).expect(401);

        // username is unchanged
        const user = await User.findOne({ address: userAddress });
        expect(user).to.not.be.null;
        expect(user!.showTutorial).to.equal(false);
    });
});
