import { utils } from "ethers";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "../middlewares/authentication";
import { Transaction } from "@daemons-fi/db-schema";
import { User } from "@daemons-fi/db-schema";
import { makeOTP } from "../OTP-maker";
import { SignatureLike } from "@ethersproject/bytes";

export const authenticationRouter = express.Router();

authenticationRouter.get(
    "/is-authenticated/:userAddress",
    authenticate,
    async (req: Request, res: Response) => {
        // add checksum to address
        const userAddress = utils.getAddress(req.params.userAddress);

        // if the address does not correspond with the cookie (or the cookie is not set)
        // we return a 401 and eventually clear the connection cookie
        if (req.userAddress !== userAddress) {
            return res.clearCookie("token").sendStatus(401);
        }

        // otherwise the user is logged. We retrieve or create the user object
        const user = await User.findOneOrCreate(userAddress);

        // check if they are banned
        if (user.banned || !user.whitelisted) {
            return res.status(403).send(user);
        }

        // retrieve extra info to be sent along with the user
        const unseenTransactions = await Transaction.countDocuments({
            beneficiaryUser: userAddress,
            date: { $gt: user.lastLogin }
        });

        // update last login date
        await User.findOneAndUpdate({ address: userAddress }, { $set: { lastLogin: new Date() } });

        // and return it otherwise
        return res.status(200).send({
            address: user.address,
            username: user.username,
            banned: user.banned,
            whitelisted: user.whitelisted,
            unseenTransactions
        });
    }
);

authenticationRouter.get("/message-to-sign/:userAddress", async (req: Request, res: Response) => {
    const userAddress = utils.getAddress(req.params.userAddress);
    const otp = makeOTP(userAddress);
    const message = composeMessage(userAddress, otp);
    return res.json({ message });
});

const composeMessage = (userAddress: string, otp: string): string =>
    `Sign this message to verify you are the owner of the address ${userAddress}. [OTP: ${otp}]`;

const verifyMessage = (userAddress: string, signedMessage: SignatureLike): boolean => {
    const otp = makeOTP(userAddress);
    const message = composeMessage(userAddress, otp);
    const decodedAddress = utils.verifyMessage(message, signedMessage);

    if (userAddress === decodedAddress) return true;

    // verification failed, let's try with the previous OTP, just in case.
    const previousOTP = makeOTP(userAddress, true);
    const messageWithPreviousOTP = composeMessage(userAddress, previousOTP);
    const decodedAddressWithPreviousOTP = utils.verifyMessage(message, messageWithPreviousOTP);

    return (userAddress === decodedAddressWithPreviousOTP);
}

authenticationRouter.post("/login", async (req: Request, res: Response) => {
    const signedMessage = req.body.signedMessage;
    const userAddress = utils.getAddress(req.body.userAddress);

    if (!verifyMessage(userAddress, signedMessage)) {
        return res.status(403).send("Invalid signature");
    }

    // generate JWT and send back
    const authToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string, {
        expiresIn: "2592000s"
    });
    res.cookie("token", authToken, { httpOnly: true, secure: true, sameSite: "none" });
    return res.send();
});
