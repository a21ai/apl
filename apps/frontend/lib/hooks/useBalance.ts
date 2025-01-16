import useSWR from "swr";
import { archConnection } from "../arch";
import {
  MintUtil,
  TOKEN_PROGRAM_ID,
  AssociatedTokenUtil,
  TokenAccountUtil,
} from "@repo/apl-sdk";

export interface TokenBalance {
  mintPubkeyHex: string;
  tokenAddressHex: string;
  balance: bigint;
  decimals: number;
  symbol?: string;
  state: "Uninitialized" | "Initialized" | "Frozen";
}

/**
 * Custom hook to fetch token balances for a public key using SWR
 * @param publicKey - The public key to fetch balances for (hex encoded)
 * @returns Object containing token balances data, loading state, and error state
 */
export function useBalance(publicKey?: string) {
  const fetcher = async (key: string) => {
    // Remove the prefix before processing
    const actualKey = key.replace("balance:", "");
    // Handle 66-char strings by removing leading '02' and taking last 64 chars
    const cleanKey =
      actualKey.length === 66 && actualKey.startsWith("02")
        ? actualKey.slice(2)
        : actualKey;
    if (!cleanKey) return [];

    try {
      // Get all token mints
      const mints = await archConnection.getProgramAccounts(TOKEN_PROGRAM_ID);
      const balances: TokenBalance[] = [];

      for (const mint of mints) {
        try {
          const mintData = MintUtil.deserialize(
            Buffer.from(mint.account.data as Uint8Array)
          );
          if (!mintData.is_initialized) continue;

          // Derive associated token account for this mint
          const associatedTokenPubkey =
            AssociatedTokenUtil.getAssociatedTokenAddress(
              mint.pubkey,
              Buffer.from(cleanKey, "hex")
            );

          // Try to fetch the associated token account
          try {
            const tokenAccountInfo = await archConnection.readAccountInfo(
              associatedTokenPubkey
            );

            if (tokenAccountInfo?.data) {
              const tokenAccount = TokenAccountUtil.deserialize(
                Buffer.from(tokenAccountInfo.data)
              );

              console.log(tokenAccount);
              console.log(Buffer.from(tokenAccount.owner).toString("hex"));

              // Only include tokens with non-zero balance
              if (tokenAccount.amount > 0n) {
                balances.push({
                  mintPubkeyHex: Buffer.from(mint.pubkey).toString("hex"),
                  tokenAddressHex: Buffer.from(associatedTokenPubkey).toString(
                    "hex"
                  ),
                  balance: tokenAccount.amount,
                  decimals: mintData.decimals,
                  state: ["Uninitialized", "Initialized", "Frozen"][
                    tokenAccount.state
                  ] as "Uninitialized" | "Initialized" | "Frozen",
                });
              }
            }
          } catch (err) {
            // Skip tokens without associated accounts
            console.debug(
              "No associated token account found for mint:",
              Buffer.from(mint.pubkey).toString("hex"),
              err
            );
          }
        } catch (err) {
          // Skip invalid mint accounts
          console.debug("Invalid mint account:", err);
        }
      }

      return balances;
    } catch (err) {
      console.error("Error fetching token balances:", err);
      return [];
    }
  };

  const { data, error, isLoading } = useSWR(
    publicKey ? `balance:${publicKey}` : null,
    fetcher
  );

  return {
    balances: data,
    isLoading,
    error,
  };
}
