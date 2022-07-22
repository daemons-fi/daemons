import { utils } from "ethers";
import express, { Request, Response } from "express";
import { authenticate } from "../middlewares/authentication";
import { TransferScript } from "@daemons-fi/db-schema";
import { Script } from "@daemons-fi/db-schema";
import { SwapScript } from "@daemons-fi/db-schema";
import { MmBaseScript } from "@daemons-fi/db-schema";
import {
    ISignedBeefyAction,
    ISignedMMAdvancedAction,
    ISignedPassAction,
    ISignedZapInAction,
    ISignedZapOutAction
} from "@daemons-fi/shared-definitions";
import { ISignedMMBaseAction } from "@daemons-fi/shared-definitions";
import { ISignedSwapAction } from "@daemons-fi/shared-definitions";
import { ISignedTransferAction } from "@daemons-fi/shared-definitions";
import { MmAdvancedScript } from "@daemons-fi/db-schema";
import { BrokenScript } from "@daemons-fi/db-schema";
import { ZapInScript } from "@daemons-fi/db-schema";
import { ZapOutScript } from "@daemons-fi/db-schema";
import { BeefyScript } from "@daemons-fi/db-schema";
import { PassScript } from "@daemons-fi/db-schema";

export const scriptsRouter = express.Router();

scriptsRouter.get("/:chainId", authenticate, async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);
    const scripts = await Script.find({ chainId: chainId }).lean();
    return res.send(scripts);
});

scriptsRouter.get("/:chainId/:userAddress", authenticate, async (req: Request, res: Response) => {
    // adds checksum to address (uppercase characters)
    const userAddress = utils.getAddress(req.params.userAddress);
    if (req.userAddress !== userAddress) {
        return res.sendStatus(403);
    }

    const chainId = String(req.params.chainId);
    const scripts = await Script.find({ user: userAddress, chainId: chainId }).lean();
    return res.send(scripts);
});

scriptsRouter.post("/", authenticate, async (req: Request, res: Response) => {
    const { script, type } = req.body;
    if (req.userAddress !== utils.getAddress(script.user)) {
        return res.sendStatus(403);
    }

    try {
        await buildScript(script, type);
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

async function buildScript(script: any, type: string): Promise<any> {
    switch (type) {
        case "TransferScript":
            await TransferScript.build(script as ISignedTransferAction).save();
            break;
        case "SwapScript":
            await SwapScript.build(script as ISignedSwapAction).save();
            break;
        case "MmBaseScript":
            await MmBaseScript.build(script as ISignedMMBaseAction).save();
            break;
        case "MmAdvancedScript":
            await MmAdvancedScript.build(script as ISignedMMAdvancedAction).save();
            break;
        case "ZapInScript":
            await ZapInScript.build(script as ISignedZapInAction).save();
            break;
        case "ZapOutScript":
            await ZapOutScript.build(script as ISignedZapOutAction).save();
            break;
        case "BeefyScript":
            await BeefyScript.build(script as ISignedBeefyAction).save();
            break;
        case "PassScript":
            await PassScript.build(script as ISignedPassAction).save();
            break;
        default:
            throw new Error(`Unsupported script type ${type}`);
    }
}

scriptsRouter.post("/update-description", authenticate, async (req: Request, res: Response) => {
    const { scriptId, description } = req.body;

    try {
        await Script.updateOne(
            { user: req.userAddress, scriptId: scriptId },
            { $set: { description } }
        );
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post("/revoke", authenticate, async (req: Request, res: Response) => {
    const { scriptId } = req.body;

    try {
        await Script.deleteOne({ user: req.userAddress, scriptId: scriptId });
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post("/mark-as-broken", authenticate, async (req: Request, res: Response) => {
    const { scriptId } = req.body;

    try {
        await BrokenScript.build({
            reporter: req.userAddress!,
            scriptId: scriptId
        }).save();
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});
