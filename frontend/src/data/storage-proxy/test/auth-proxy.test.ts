import { expect } from "chai";
import { storageAddress, StorageProxy } from "..";
import nock from "nock";

describe("Auth Proxy", () => {
    // note: login function is not tested as it's just a request
    // and the job is done server-side.

    afterEach(() => {
        nock.cleanAll();
    });

    const userAddress = "0xa82e30f01a4e2f526a2b7a268e73078a74448af8";

    describe("checkAuthentication", () => {
        it("returns the user object if the address is correctly verified in the server", async () => {
            nock(`${storageAddress}`)
                .get(`/auth/is-authenticated/${userAddress}`)
                .reply(200, { address: userAddress, username: userAddress, banned: false });

            const user = await StorageProxy.auth.checkAuthentication(userAddress);
            expect(user).to.not.be.undefined;
            expect(user!.address).to.equal(userAddress);
            expect(user!.username).to.equal(userAddress);
            expect(user!.banned).to.equal(false);
        });

        it("returns undefined if the server does could not verify the address", async () => {
            nock(`${storageAddress}`)
                .get(`/auth/is-authenticated/${userAddress}`)
                .reply(500, undefined);

            const user = await StorageProxy.auth.checkAuthentication(userAddress);
            expect(user).to.be.undefined;
        });
    });

    describe("getLoginMessage", () => {
        it("returns the message given by the server", async () => {
            nock(`${storageAddress}`)
                .get(`/auth/message-to-sign/${userAddress}`)
                .reply(200, { message: "YOLO" });

            const result = await StorageProxy.auth.getLoginMessage(userAddress);
            expect(result).to.be.equal("YOLO");
        });
    });
});
