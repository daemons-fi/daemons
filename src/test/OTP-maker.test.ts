import { expect } from "chai";
import Sinon from "sinon";
import { makeOTP, OTP_SLOT_SECONDS } from "../OTP-maker";

describe("OTP-maker", () => {
    const userAddress = "0xb79f76ef2c5f0286176833e7b2eee103b1cc3244";

    afterEach(async () => {
        Sinon.restore();
    });

    it("returns reliable results", async () => {
        const now = Date.now();
        Sinon.stub(Date, "now").returns(now);

        const opts = [];
        for (let i = 0; i < 100; i++) opts.push(makeOTP(userAddress));

        expect(new Set(opts).size).to.equal(1);
    });

    it("the 'previous' flag allows to get the OTP of the previous time slot", async () => {
        const now = Date.now();
        Sinon.stub(Date, "now").returns(now);
        const prevOTP = makeOTP(userAddress);

        Sinon.restore();
        Sinon.stub(Date, "now").returns(now + OTP_SLOT_SECONDS * 1.2 * 1000); // N seconds in the future
        const currentOTP = makeOTP(userAddress);

        expect(prevOTP).to.not.equal(currentOTP);
        expect(prevOTP).to.equal(makeOTP(userAddress, true));
    });

    it("the different addresses give different OTPs", async () => {
        const now = Date.now();
        Sinon.stub(Date, "now").returns(now);

        const user1OTP = makeOTP(userAddress);
        const user2OTP = makeOTP("0x6dea879e2eebf245ce11e8b24ecffd197d206aad");

        expect(user1OTP).to.not.equal(user2OTP);
    });
});
