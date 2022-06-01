export interface IContractsList {
    GasTank: string;
    DAEMToken: string;
    Treasury: string;
    GasPriceFeed: string;
    PriceRetriever: string;

    // executors
    SwapExecutor: string;
    TransferExecutor: string;
    MmBaseExecutor: string;
    MmAdvancedExecutor: string;
}

export const kovanContracts: IContractsList = {
    PriceRetriever: "0x5348715150E8a11Da072f8065CEF24ca5f97d4f5",
    DAEMToken: "0xD6b7248D6e2971064250F920E4C476Fb6b1fE4B4",
    GasTank: "0x6A6D4991Bf6a9cA780a5d3D8A47ACda94caF71B7",
    Treasury: "0xFc4eCEC41D91f843084d53b8b352867bc5A60324",
    GasPriceFeed: "0x884edAf39D938Ba2CB7D335F38FC58C105d2C96b",

    SwapExecutor: "0x84e396e9E60A68e90F6D57CC38CB7A56019Ca2e8",
    TransferExecutor: "0xEcA0c2CFF4D7a85974Da1f288A6cef588498D41A",
    MmBaseExecutor: "0x6E8a070c7F8598d155EE3a5da13E5B3CeFd9aE15",
    MmAdvancedExecutor: "0x2fa5FB3e37C2802ef67823e38C09b1Dfe83A2d68"
};

export const fantomTestnetContracts: IContractsList = {
    PriceRetriever: "0x460ecd537e357890D3F888e92c5d5bF1452684bd",
    DAEMToken: "0x05Af9c3a34c9453e997ad73aBD6A65afCc75411B",
    GasTank: "0xE3A2D9ddE8Be45809abC20529109CBed11e93003",
    Treasury: "0xeFe6A3dc992FCe64403eCd11b04F1244A6efEdC1",
    GasPriceFeed: "0xD706CFe3B1cf42CF6024fCAcF356ef321005D9D2",

    SwapExecutor: "0x0A24c2e6B7939e6C46844609Db88E512CB6a4122",
    TransferExecutor: "0xfD55cbA6E67D374fd1939159153bc1B50e18CCE5",
    MmBaseExecutor: "0xF4210c6bff554B8Ca9eF2c5cbFe33B0d3dfA9Fe7",
    MmAdvancedExecutor: "0x63486B2296Afb4a9C588B10aA7B210d97aD4F024"
};
