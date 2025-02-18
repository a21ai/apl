export const RPC_URL = "http://localhost:9002";

export const TOKEN_PROGRAMS = {
  "8965006a7590d76735d6c1ce2cf0e36efa6cad707bcbfbfb095d8449a7b0a7fc": {
    name: "Bitcoin",
    ticker: "BTC",
    icon: "/btc.png",
  },
  "5f491363b5f6d4d6248308a17121af4725cb6bb61f5963fc74d9542c5d5584ed": {
    name: "Stoner Cat",
    ticker: "SCAT",
    icon: "/stoned-cat.gif",
  },
} as const;

// Token ID for APL token operations (32-byte hex string)
// This is a placeholder ID for initial implementation
// Format: 32 bytes represented as 64 hex characters
export const HARDCODED_TOKEN_ID =
  "apl-token00000000000000000000000000000000000000000000000000";
