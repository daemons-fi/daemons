import {
    ISwapAction,
    IZapInAction,
    IZapOutAction,
    swapDomain,
    swapTypes,
    zapInDomain,
    zapInTypes,
    zapOutDomain,
    zapOutTypes
} from "@daemons-fi/shared-definitions";
import { ITransferAction, transferDomain, transferTypes } from "@daemons-fi/shared-definitions";
import { IMMBaseAction, mmBaseDomain, mmBaseTypes } from "@daemons-fi/shared-definitions";
import { IMMAdvancedAction, mmAdvDomain, mmAdvTypes } from "@daemons-fi/shared-definitions";
import { TransferMessageFactory } from "./messages-factories/transfer-message-factory";
import { GetCurrentChain, IsChainSupported } from "../data/chain-info";
import { ICurrentScript } from "./i-current-script";
import { BaseScript, ZapInScript, ZapOutScript } from "@daemons-fi/scripts-definitions";
import { ScriptAction } from "../data/chains-data/action-form-interfaces";
import { SwapScript } from "@daemons-fi/scripts-definitions";
import { TransferScript } from "@daemons-fi/scripts-definitions";
import { MmBaseScript } from "@daemons-fi/scripts-definitions";
import { SwapMessageFactory } from "./messages-factories/swap-message-factory";
import { MmBaseMessageFactory } from "./messages-factories/mm-base-message-factory";
import { MmAdvMessageFactory } from "./messages-factories/mm-adv-message-factory";
import { MmAdvancedScript } from "@daemons-fi/scripts-definitions";
import { ZapInMessageFactory } from "./messages-factories/zap-in-message-factory";
import { ZapOutMessageFactory } from "./messages-factories/zap-out-message-factory";

type ScriptDefinition =
    | ISwapAction
    | ITransferAction
    | IMMBaseAction
    | IMMAdvancedAction
    | IZapInAction
    | IZapOutAction;

interface IMessage {
    script: ScriptDefinition;
    domain: any;
    types: any;
}

/**
 * Class used to compose the script from the form and ask the user to sign it with metamask.
 * Caches user wallet for internal operations, so do not reuse, create anew every time.
 * */
export class ScriptFactory {
    private readonly ethers: any;
    private readonly provider: any;
    private readonly signer: any;
    private readonly chainId: string;

    public constructor(chainId: string) {
        this.ethers = require("ethers");
        this.provider = new this.ethers.providers.Web3Provider((window as any).ethereum, "any");
        this.signer = this.provider.getSigner();
        this.chainId = chainId;
    }

    public async SubmitScriptsForSignature(bundle: ICurrentScript): Promise<BaseScript> {
        const getSignature = async (message: IMessage) =>
            (await this.signer._signTypedData(
                message.domain,
                message.types,
                message.script
            )) as string;
        if (!IsChainSupported(this.chainId))
            throw new Error(`Chain ${this.chainId} is not supported!`);
        const chain = GetCurrentChain(this.chainId);

        switch (bundle.action.form.type) {
            case ScriptAction.SWAP:
                const swapMessage = {
                    script: await SwapMessageFactory.create(bundle, chain, this.provider),
                    domain: swapDomain,
                    types: swapTypes
                };
                const swapScriptSignature = await getSignature(swapMessage);
                return new SwapScript(swapMessage.script, swapScriptSignature, bundle.description);

            case ScriptAction.TRANSFER:
                const transferMessage = {
                    script: await TransferMessageFactory.create(bundle, chain, this.provider),
                    domain: transferDomain,
                    types: transferTypes
                };
                const transferScriptSignature = await getSignature(transferMessage);
                return new TransferScript(
                    transferMessage.script,
                    transferScriptSignature,
                    bundle.description
                );

            case ScriptAction.MM_BASE:
                const mmBaseMessage = {
                    script: await MmBaseMessageFactory.create(bundle, chain, this.provider),
                    domain: mmBaseDomain,
                    types: mmBaseTypes
                };
                const mmBaseScriptSignature = await getSignature(mmBaseMessage);
                return new MmBaseScript(
                    mmBaseMessage.script,
                    mmBaseScriptSignature,
                    bundle.description
                );

            case ScriptAction.MM_ADV:
                const mmAdvancedMessage = {
                    script: await MmAdvMessageFactory.create(bundle, chain, this.provider),
                    domain: mmAdvDomain,
                    types: mmAdvTypes
                };
                const mmAdvancedScriptSignature = await getSignature(mmAdvancedMessage);
                return new MmAdvancedScript(
                    mmAdvancedMessage.script,
                    mmAdvancedScriptSignature,
                    bundle.description
                );

            case ScriptAction.ZAP_IN:
                const zapInMessage = {
                    script: await ZapInMessageFactory.create(bundle, chain, this.provider),
                    domain: zapInDomain,
                    types: zapInTypes
                };
                const zapInScriptSignature = await getSignature(zapInMessage);
                return new ZapInScript(
                    zapInMessage.script,
                    zapInScriptSignature,
                    bundle.description
                );

            case ScriptAction.ZAP_OUT:
                const zapOutMessage = {
                    script: await ZapOutMessageFactory.create(bundle, chain, this.provider),
                    domain: zapOutDomain,
                    types: zapOutTypes
                };
                const zapOutScriptSignature = await getSignature(zapOutMessage);
                return new ZapOutScript(
                    zapOutMessage.script,
                    zapOutScriptSignature,
                    bundle.description
                );

            default:
                throw new Error("Not implemented");
        }
    }
}
