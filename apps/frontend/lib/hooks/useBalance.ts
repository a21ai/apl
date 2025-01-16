import useSWR from "swr";
import { archConnection } from "../arch";
import {
  MintUtil,
  TOKEN_PROGRAM_ID,
  AssociatedTokenUtil,
  TokenAccountUtil,
} from "@repo/apl-sdk";
import { TOKEN_PROGRAMS } from "../constants";
import { initializeWallet as initializeWalletAction } from "@/app/actions";
import { useCallback } from "react";
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
 * @returns Object containing token balances data, loading state, error state, and initialization status
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
    if (!cleanKey) return { balances: [], isInitialized: false };

    try {
      // Get all token mints
      const mints = await archConnection.getProgramAccounts(TOKEN_PROGRAM_ID);
      const balances: TokenBalance[] = [];

      // Track which tokens we've found
      const requiredTokens = new Set(Object.keys(TOKEN_PROGRAMS));
      const foundTokens = new Set<string>();

      for (const mint of mints) {
        try {
          const mintPubkeyHex = Buffer.from(mint.pubkey).toString("hex");
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

            // Check if this is one of our required tokens
            if (requiredTokens.has(mintPubkeyHex)) {
              foundTokens.add(mintPubkeyHex);
            }

            if (tokenAccountInfo?.data) {
              const tokenAccount = TokenAccountUtil.deserialize(
                Buffer.from(tokenAccountInfo.data)
              );

              // Only include tokens with non-zero balance
              if (tokenAccount.amount > 0n) {
                balances.push({
                  mintPubkeyHex,
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
              mintPubkeyHex,
              err
            );
          }
        } catch (err) {
          // Skip invalid mint accounts
          console.debug("Invalid mint account:", err);
        }
      }

      // Wallet is initialized if we found all required tokens
      const isInitialized = foundTokens.size === requiredTokens.size;

      return {
        balances,
        isInitialized,
      };
    } catch (err) {
      console.error("Error fetching token balances:", err);
      return { balances: [], isInitialized: false };
    }
  };

  const { data, error, isLoading, mutate } = useSWR(
    publicKey ? `balance:${publicKey}` : null,
    fetcher
  );

  const isInitialized = data?.isInitialized ?? false;

  const initializeWallet = useCallback(async () => {
    if (!publicKey) return;
    await initializeWalletAction(publicKey);

    // Start polling until initialized
    const pollInterval = setInterval(async () => {
      const result = await mutate(undefined, true);
      if (result?.isInitialized) {
        clearInterval(pollInterval);
      }
    }, 1000);

    // Cleanup interval if component unmounts
    return () => clearInterval(pollInterval);
  }, [publicKey, mutate]);

  return {
    balances: data?.balances ?? [],
    isInitialized,
    error,
    initializeWallet,
    mutate,
    isLoading,
  };
}
