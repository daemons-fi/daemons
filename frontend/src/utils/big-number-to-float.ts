import { BigNumber } from "ethers";

export const bigNumberToFloat = (
    amount: BigNumber,
    outputDecimals: number = 4,
    inputDecimals: number = 18,
): number => {
    // used for integer division
    const firstDivisor = BigNumber.from(10).pow(inputDecimals - outputDecimals);

    // used for float division (so to maintain some fractional digits)
    const secondDivisor = BigNumber.from(10).pow(outputDecimals).toNumber();

    return amount.div(firstDivisor).toNumber() / secondDivisor;
};
