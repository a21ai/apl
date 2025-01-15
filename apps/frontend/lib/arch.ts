import { RpcConnection } from "@repo/arch-sdk";
import { rpcConfig } from "./config";

if (!process.env.NEXT_PUBLIC_RPC_URL) {
  throw new Error("NEXT_PUBLIC_RPC_URL environment variable is not set");
}

// Create a singleton connection instance
export const archConnection = new RpcConnection(rpcConfig.url);
