import { getGasLimitForScript } from "@daemons-fi/scripts-definitions/build";
import { BigNumber, utils } from "ethers";
import { bigNumberToFloat } from "../../utils/big-number-to-float";
import { fetchDAEMPriceInETHWithCache } from "../../utils/daem-price-retriever";
import { fetchGasPriceWithCache } from "../../utils/gas-price-retriever";

interface ITxCostsAndProfits {
    costDAEM: number;
    costETH: number;
    profitDAEM: number;
}

export async function getTxCostsAndProfits(script: any): Promise<ITxCostsAndProfits> {
    const gasPrice = await fetchGasPriceWithCache(script.chainId);
    const gasLimit = getGasLimitForScript(script.__type);

    const costDAEM = BigNumber.from(script.tip);
    const costETH = gasLimit.mul(gasPrice);

    // the profits equal to
    // - costETH converted to DAEM
    // - costDAEM * (1 - tax)

    const DAEMpriceInETH = await fetchDAEMPriceInETHWithCache(script.chainId);
    const ethToDaem = bigNumberToFloat(costETH, 6) / bigNumberToFloat(DAEMpriceInETH, 6);
    const tipWithoutTaxes = costDAEM.mul(8).div(10); // 20% TAX
    const profitDAEM = tipWithoutTaxes.add(utils.parseEther(ethToDaem.toString()));

    return {
        costDAEM: bigNumberToFloat(costDAEM),
        costETH: bigNumberToFloat(costETH, 5),
        profitDAEM: bigNumberToFloat(profitDAEM)
    };
}
