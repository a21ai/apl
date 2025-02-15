import axios from "axios";
import { UtxoMetaData } from "@repo/arch-sdk";

export type RPCConfig = {
  url: string;
  username: string;
  password: string;
};

// Base RPC request function to handle common request logic
const sendRPCRequest = async (
  config: RPCConfig,
  method: string,
  params: any[],
  walletName?: string
) => {
  const url = walletName ? `${config.url}/wallet/${walletName}` : config.url;
  const auth = {
    username: config.username,
    password: config.password,
  };

  const response = await axios.post(
    url,
    {
      jsonrpc: "2.0",
      id: "1",
      method,
      params,
    },
    { auth }
  );

  if (response?.data?.error) {
    console.log(method, params, response.data);
  }

  return response.data;
};

// Wallet management functions
export const loadWallet = async (
  config: RPCConfig,
  walletName: string
): Promise<void> => {
  const r = await sendRPCRequest(config, "loadwallet", [walletName]);
  await sendRPCRequest(config, "getbalance", []);

  if (r?.error?.code == -18) {
    await createWallet(config, walletName);
    await sendRPCRequest(config, "loadwallet", [walletName]);
  }

  console.log(`✓ Wallet '${walletName}' loaded successfully.`);
};

export const createWallet = async (
  config: RPCConfig,
  walletName: string
): Promise<void> => {
  await sendRPCRequest(config, "createwallet", [walletName]);
};

export const unloadWallet = async (
  config: RPCConfig,
  walletName: string
): Promise<void> => {
  await sendRPCRequest(config, "unloadwallet", [walletName]);
  console.log(`✓ Wallet '${walletName}' unloaded successfully.`);
};

// Send coins to address
export const sendToAddress = async (
  config: RPCConfig,
  to: string,
  amount: number,
  walletName: string
): Promise<string> => {
  console.log(`ℹ Sending ${amount} satoshis to address: ${to}`);
  const res = await sendRPCRequest(
    config,
    "sendtoaddress",
    [to, amount / 1e8, "", "", false, true, 1, "economical"],
    walletName
  );

  // Insufficient funds
  if (res?.error?.code == -6) {
    await generateToAddress(config, walletName);
  }

  console.log(`✓ Coins sent successfully! Transaction ID: ${res.result}`);
  return res.result;
};

export const generateToAddress = async (
  config: RPCConfig,
  walletName: string
): Promise<void> => {
  const r = await sendRPCRequest(config, "getnewaddress", [walletName]);
  await sendRPCRequest(config, "generatetoaddress", [101, r.result]);
  await sendRPCRequest(config, "getbalances", []);
};

export const sendCoins = async (
  config: RPCConfig,
  to: string,
  amount: number
): Promise<UtxoMetaData> => {
  try {
    const walletName = "testwallet";

    await loadWallet(config, walletName);
    const txid = await sendToAddress(config, to, amount, walletName);
    await unloadWallet(config, walletName);

    return {
      txid,
      vout: 0,
    };
  } catch (error) {
    // @ts-ignore
    console.log(error?.response?.data);
    throw error;
  }
};
