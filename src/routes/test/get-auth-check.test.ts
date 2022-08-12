import supertest from "supertest";
import { app } from "../../app";
import jwt from "jsonwebtoken";
import faker from "@faker-js/faker";
import { expect } from "chai";
import { IUser, User } from "@daemons-fi/db-schema";
import { clearTestDb, closeTestDb, connectToTestDb } from "../../test/test-db-handler";
import { ethers } from "ethers";
import { userDocumentFactory } from "@daemons-fi/db-schema";
import { transactionDocumentFactory } from "@daemons-fi/db-schema";

describe("GET api/auth/is-authenticated/:userAddress", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = "0xb79f76ef2c5f0286176833e7b2eee103b1cc3244";
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it("returns 200 if the user is authenticated", async () => {
        await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}/42`)
            .set("Cookie", `token=${jwToken}`)
            .expect(200);
    });

    it("creates a user in the DB if it is the first authentication", async () => {
        let users = await User.find({});
        expect(users.length).to.equal(0);

        await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}/42`)
            .set("Cookie", `token=${jwToken}`)
            .expect(200);

        const addressWithChecksum = ethers.utils.getAddress(userAddress);
        users = await User.find({});
        expect(users.length).to.equal(1);
        expect(users[0].address).to.equal(addressWithChecksum);
        // username is initially set to be equal to the address
        expect(users[0].username).to.equal(addressWithChecksum);
    });

    it("returns the user from DB", async () => {
        const response = await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}/42`)
            .set("Cookie", `token=${jwToken}`)
            .expect(200);

        const addressWithChecksum = ethers.utils.getAddress(userAddress);
        const user = response.body as IUser;
        expect(user.address).to.equal(addressWithChecksum);
    });

    it("returns existing user when authenticating", async () => {
        const addressWithChecksum = ethers.utils.getAddress(userAddress);
        await userDocumentFactory({ address: addressWithChecksum, username: "scaloppino" });

        const response = await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}/42`)
            .set("Cookie", `token=${jwToken}`)
            .expect(200);

        const user = response.body as IUser;
        expect(user.username).to.equal("scaloppino");
    });

    it("returns unseen transactions along the response", async () => {
        const addressWithChecksum = ethers.utils.getAddress(userAddress);
        // add some transactions happened before the user's last login date
        await transactionDocumentFactory({beneficiaryUser: addressWithChecksum });
        await transactionDocumentFactory({beneficiaryUser: addressWithChecksum });

        await userDocumentFactory({ address: addressWithChecksum });

        await transactionDocumentFactory({beneficiaryUser: addressWithChecksum});
        await transactionDocumentFactory({beneficiaryUser: addressWithChecksum});
        await transactionDocumentFactory({beneficiaryUser: addressWithChecksum});

        const response = await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}/42`)
            .set("Cookie", `token=${jwToken}`)
            .expect(200);

        const user = response.body;
        expect(user.unseenTransactions).to.equal(3);
    });

    it("returns 403 if the user is banned", async () => {
        // create banned user
        const addressWithChecksum = ethers.utils.getAddress(userAddress);
        await userDocumentFactory({ address: addressWithChecksum, banned: true });

        await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}/42`)
            .set("Cookie", `token=${jwToken}`)
            .expect(403);
    });

    it("returns a 401 error if the user is not authenticated", async () => {
        await supertest(app).get(`/api/auth/is-authenticated/${userAddress}/42`).expect(401);
    });

    it("returns a 401 error and deletes cookie if the JWT does not correspond to the user", async () => {
        const randomUser = faker.finance.ethereumAddress();
        const anotherJwt = jwt.sign({ userAddress: randomUser }, process.env.JWT_SECRET as string);

        await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}/42`)
            .set("Cookie", `token=${anotherJwt}`)
            .expect(401)
            // cookie should be deleted (by clearing the value and setting a past date)
            .expect((res) =>
                expect(res.headers["set-cookie"][0]).to.equal(
                    "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
                )
            );
    });
});
