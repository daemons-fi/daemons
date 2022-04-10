import { ISwapAction, swapDomain, swapTypes } from "@daemons-fi/shared-definitions";
import { ITransferAction, transferDomain, transferTypes } from "@daemons-fi/shared-definitions";
import { IMMBaseAction, mmBaseDomain, mmBaseTypes } from "@daemons-fi/shared-definitions";
import { TransferMessageFactory } from "./messages-factories/transfer-message-factory";
import { GetCurrentChain, IsChainSupported } from "../data/chain-info";
import { Token } from "../data/chains-data/interfaces";
import { ICurrentScript } from "./i-current-script";
import { BaseScript } from "../data/script/base-script";
import { ScriptAction } from "../data/chains-data/action-form-interfaces";
import { SwapScript } from "../data/script/swap-script";
import { TransferScript } from "../data/script/transfer-script";
import { MmBaseScript } from "../data/script/mm-base-script";
import { SwapMessageFactory } from "./messages-factories/swap-message-factory";
import { MmBaseMessageFactory } from "./messages-factories/mm-base-message-factory";

type ScriptDefinition = ISwapAction | ITransferAction | IMMBaseAction;

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
    private readonly tokens: Token[];
    private readonly chainId: string;

    public constructor(chainId: string, tokens: Token[]) {
        this.ethers = require("ethers");
        this.provider = new this.ethers.providers.Web3Provider((window as any).ethereum, "any");
        this.signer = this.provider.getSigner();
        this.tokens = tokens;
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
                const swapScriptDescription = SwapScript.getDefaultDescription(
                    swapMessage.script,
                    this.tokens
                );
                return new SwapScript(
                    swapMessage.script,
                    swapScriptSignature,
                    swapScriptDescription
                );

            case ScriptAction.TRANSFER:
                const transferMessage = {
                    script: await TransferMessageFactory.create(bundle, chain, this.provider),
                    domain: transferDomain,
                    types: transferTypes
                };
                const transferScriptSignature = await getSignature(transferMessage);
                const transferScriptDescription = TransferScript.getDefaultDescription(
                    transferMessage.script,
                    this.tokens
                );
                return new TransferScript(
                    transferMessage.script,
                    transferScriptSignature,
                    transferScriptDescription
                );

            case ScriptAction.MMBASE:
                const mmBaseMessage = {
                    script: await MmBaseMessageFactory.create(bundle, chain, this.provider),
                    domain: mmBaseDomain,
                    types: mmBaseTypes
                };
                const mmBaseScriptSignature = await getSignature(mmBaseMessage);
                const mmBaseScriptDescription = MmBaseScript.getDefaultDescription(
                    mmBaseMessage.script,
                    this.tokens
                );
                return new MmBaseScript(
                    mmBaseMessage.script,
                    mmBaseScriptSignature,
                    mmBaseScriptDescription
                );

            default:
                throw new Error("Not implemented");
        }
    }
}
