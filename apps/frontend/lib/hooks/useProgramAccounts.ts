import useSWR from "swr";
import { archConnection } from "../arch";
import { PubkeyUtil } from "@saturnbtcio/arch-sdk";

/**
 * Custom hook to fetch an Arch address using SWR
 * @param publicKey - The public key to fetch the address for
 * @returns Object containing the address data, loading state, and error state
 */
export function useProgramAccounts(publicKey: string) {
  // Define fetcher function that uses archConnection
  const fetcher = async (key: string) => {
    // Remove the prefix before processing
    const actualKey = key.replace("program-accounts:", "");
    if (!actualKey) return null;
    try {
      console.log(Buffer.from(actualKey, "hex"));
      const address = await archConnection.getProgramAccounts(
        PubkeyUtil.fromHex(actualKey)
      );
      return address;
    } catch (error) {
      console.error("Error fetching program accounts:", error);
      throw error;
    }
  };

  // Use SWR hook with conditional fetching and prefixed key
  const { data, error, isLoading } = useSWR(
    // Add prefix to create unique cache key
    publicKey ? `program-accounts:${publicKey}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Disable automatic revalidation on window focus
      revalidateOnReconnect: true, // Enable revalidation on reconnect
    }
  );

  return {
    accounts: data,
    isLoading,
    error,
  };
}
