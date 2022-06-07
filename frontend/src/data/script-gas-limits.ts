import { BigNumber } from "ethers";

const gasLimits: { [scriptType: string]: number } = {
    SwapScript: 300000,
    TransferScript: 150000,
    MmBaseScript: 300000,
    MmAdvancedScript: 325000
};

export const getGasLimitForScript = (scriptType: string): BigNumber => {
    const gasLimit = gasLimits[scriptType];
    if (!gasLimit) throw new Error(`Unrecognized script type: ${scriptType}`);
    return BigNumber.from(gasLimit);
};
