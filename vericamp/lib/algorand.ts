import algosdk from "algosdk";

// Use AlgoNode free API for Testnet
const ASSET_ID = 0; // We will mock this or use a real ID if we deploy
const ALGOD_TOKEN = "";
const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
const ALGOD_PORT = "";

export const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

export const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
