export const RPC_URL = "http://localhost:9002";

export const TOKEN_PROGRAMS = {
  "71850f9a782510b8dec44c1eb724a9d7d3bde7844f031a48b1a44e5ca4b73544": {
    name: "Bitcoin",
    ticker: "BTC",
    icon: "/btc.png",
  },
  "1f78223bff1496990d959b9b040a272472b36bca2ae661a438a0a4bad6c68205": {
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
