export const rpcConfig = {
  url: process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:9002",
  username: process.env.RPC_USERNAME || "user",
  password: process.env.RPC_PASSWORD || "password",
};
