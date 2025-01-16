import { RpcConnection } from "@repo/arch-sdk";
import { RPC_URL } from "./constants";

// Create a singleton connection instance
export const archConnection = new RpcConnection(RPC_URL);
