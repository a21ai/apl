import axios from "axios";
import { UtxoMetaData } from "@repo/arch-sdk";

export type RPCConfig = {
  url: string;
  username: string;
  password: string;
};

export const sendCoins = async (
  config: RPCConfig,
  to: string,
  amount: number
): Promise<UtxoMetaData> => {
  try {
    const url = `${config.url}/wallet/testwallet`;
    const auth = {
      username: config.username,
      password: config.password,
    };

    try {
      await axios.post(
        url,
        {
          jsonrpc: "2.0",
          id: "1",
          method: "loadwallet",
          params: ["testwallet"],
        },
        {
          auth,
        }
      );
      console.log("✓ Wallet 'testwallet' loaded successfully.");
    } catch (error) {}

    console.log(`ℹ Sending ${amount} satoshis to address: ${to}`);
    const response = await axios.post(
      url,
      {
        jsonrpc: "2.0",
        id: "1",
        method: "sendtoaddress",
        params: [to, amount / 1e8, "", "", false, true, 1, "economical"],
      },
      {
        auth,
      }
    );

    // Extract txid from response and log success message
    const txid = response.data.result;
    console.log(`✓ Coins sent successfully! Transaction ID: ${txid}`);

    await axios.post(
      url,
      {
        jsonrpc: "2.0",
        id: "1",
        method: "unloadwallet",
        params: ["testwallet"],
      },
      {
        auth,
      }
    );
    console.log("✓ Wallet 'testwallet' unloaded successfully.");

    const res: UtxoMetaData = {
      txid,
      vout: 0,
    };

    return res;
  } catch (error) {
    // @ts-ignore
    console.log(error?.response?.data);
    throw error;
  }
};
