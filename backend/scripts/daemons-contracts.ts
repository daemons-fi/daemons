import { Contract } from "ethers";
import { ethers } from "hardhat";

export type DaemonsContracts = { [contractName: string]: string };
export const contracts: { [chainId: number]: DaemonsContracts } = {
    // Kovan
    42: {
        UniswapV2Router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        AavePriceOracle: "0xb8be51e6563bb312cbb2aa26e352516c25c26ac1",
        PriceRetriever: "0x5348715150E8a11Da072f8065CEF24ca5f97d4f5",
        DaemonsToken: "0xD6b7248D6e2971064250F920E4C476Fb6b1fE4B4",
        GasTank: "0x6A6D4991Bf6a9cA780a5d3D8A47ACda94caF71B7",
        Treasury: "0xFc4eCEC41D91f843084d53b8b352867bc5A60324",
        Vesting: "0x175c1AC32e6E2BFb2361203d6f8531c2d93aF81B",
        GasPriceFeed: "0x884edAf39D938Ba2CB7D335F38FC58C105d2C96b",
        SwapperScriptExecutor: "0x84e396e9E60A68e90F6D57CC38CB7A56019Ca2e8",
        TransferScriptExecutor: "0xEcA0c2CFF4D7a85974Da1f288A6cef588498D41A",
        MmBaseScriptExecutor: "0x6E8a070c7F8598d155EE3a5da13E5B3CeFd9aE15",
        MmAdvancedScriptExecutor: "0x2fa5FB3e37C2802ef67823e38C09b1Dfe83A2d68",
        ZapInScriptExecutor: "0xF767b1A5623F001aBe843b0B958d1a4e62100C6D",
        ZapOutScriptExecutor: "0x422C9642a1f47C016f1E0153dBE83e6B9498EF16"
    },
    // Fantom Testnet
    4002: {
        UniswapV2Router: "0xa6AD18C2aC47803E193F75c3677b14BF19B94883",
        AavePriceOracle: "0xA840C768f7143495790eC8dc2D5f32B71B6Dc113",
        PriceRetriever: "0x460ecd537e357890D3F888e92c5d5bF1452684bd",
        DaemonsToken: "0x05Af9c3a34c9453e997ad73aBD6A65afCc75411B",
        GasTank: "0xE3A2D9ddE8Be45809abC20529109CBed11e93003",
        Treasury: "0xeFe6A3dc992FCe64403eCd11b04F1244A6efEdC1",
        Vesting: "0x9418AB6CA02487700008866BdA18d7BB13ee7b7f",
        GasPriceFeed: "0xD706CFe3B1cf42CF6024fCAcF356ef321005D9D2",
        SwapperScriptExecutor: "0x0A24c2e6B7939e6C46844609Db88E512CB6a4122",
        TransferScriptExecutor: "0xfD55cbA6E67D374fd1939159153bc1B50e18CCE5",
        MmBaseScriptExecutor: "0xF4210c6bff554B8Ca9eF2c5cbFe33B0d3dfA9Fe7",
        MmAdvancedScriptExecutor: "0x63486B2296Afb4a9C588B10aA7B210d97aD4F024",
        ZapInScriptExecutor: "0xa94413716dCec6A7343E495d963e1bdc7c52945f",
        ZapOutScriptExecutor: "0x9f82626CaD80b6C87ee681c21F1E46AFD5cE2222"
    }
};

export const getContractAddress = (contracts: DaemonsContracts, contractName: string): string => {
    const address: string | undefined = contracts[contractName];
    if (!address) throw new Error(`Could not find address for contract ${contractName}`);
    return address;
};

export const getContract = async (
    contracts: DaemonsContracts,
    contractName: string
): Promise<Contract> => {
    const address = getContractAddress(contracts, contractName);
    return await ethers.getContractAt(contractName, address);
};

export const updateContracts = (
    contracts: DaemonsContracts,
    contractName: string,
    contractAddress: string
): DaemonsContracts => {
    const copyOfContracts = JSON.parse(JSON.stringify(contracts));
    copyOfContracts[contractName] = contractAddress;
    console.log(`Contracts updated:`);
    printContracts(copyOfContracts);
    return copyOfContracts;
};

export const printContracts = (contracts: DaemonsContracts): void => {
    Object.keys(contracts).forEach((k) => console.log(`"${k}": "${contracts[k]}",`));
};
