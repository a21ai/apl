export const RPC_URL = "http://localhost:9002";

export const TOKEN_PROGRAMS = {
  ba9dc4025b736d94ca520ef5d9a4089cc2e1d1d8b66c91e28ce1250e0819f497: {
    name: "Bitcoin",
    ticker: "BTC",
    icon: "/btc.png",
  },
  "6cf56a417931a9ea5b936bb23c4ce999e0523b1aced3755639eacaa0414ca64d": {
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
