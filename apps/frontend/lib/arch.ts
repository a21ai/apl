import { ArchConnection, RpcConnection } from "@repo/arch-sdk";
import { RPC_URL } from "@/lib/constants";

export const rpcConnection = new RpcConnection(RPC_URL);
export const archConnection = ArchConnection(rpcConnection);
