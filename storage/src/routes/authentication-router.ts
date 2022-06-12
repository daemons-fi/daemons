import { utils } from "ethers";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "../middlewares/authentication";
import { User } from "../models/user";

export const authenticationRouter = express.Router();
const OTPs: { [address: string]: number } = {};


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
        if (user.banned) {
            return res.status(403).send(user);
        }

        // and return it otherwise
        return res.status(200).send(user);
    }
);

authenticationRouter.get("/message-to-sign/:userAddress", async (req: Request, res: Response) => {
    const userAddress = utils.getAddress(req.params.userAddress);

    // create a one time password and cache it
    const otp = Math.floor(Math.random() * 1000000);
    OTPs[userAddress] = otp;

    const message = composeMessage(userAddress, otp);
    return res.json({ message });
});

const composeMessage = (userAddress: string, otp: number): string =>
    `Sign this message to verify you are the owner of the address ${userAddress}. [OTP: ${otp}]`;

authenticationRouter.post("/login", async (req: Request, res: Response) => {
    const signedMessage = req.body.signedMessage;
    const userAddress = utils.getAddress(req.body.userAddress);

    // retrieve and delete the OTP of the user
    const otp = OTPs[userAddress];
    delete OTPs[userAddress];
    const message = composeMessage(userAddress, otp);

    const decodedAddress = utils.verifyMessage(message, signedMessage);

    if (userAddress !== decodedAddress) {
        return res.status(403).send("Invalid signature");
    }

    // generate JWT and send back
    const authToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string, {
        expiresIn: "2592000s"
    });
    res.cookie("token", authToken, { httpOnly: true, secure: true, sameSite: "none" });
    return res.send();
});
