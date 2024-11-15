import useSWR from "swr";
import { archConnection } from "../arch";

/**
 * Custom hook to fetch an Arch address using SWR
 * @param publicKey - The public key to fetch the address for
 * @returns Object containing the address data, loading state, and error state
 */
export function useArchAddress(publicKey: String) {
  // Define fetcher function that uses archConnection
  const fetcher = async (key: string) => {
    if (!key) return null;
    try {
      console.log(Buffer.from(key, "hex"));
      const address = await archConnection.getAccountAddress(
        Buffer.from(key, "hex").slice(1)
      );
      return address;
    } catch (error) {
      console.error("Error fetching arch address:", error);
      throw error;
    }
  };

  // Use SWR hook with conditional fetching
  const { data, error, isLoading } = useSWR(
    // Only fetch if publicKey exists
    publicKey ? publicKey : null,
    fetcher,
    {
      revalidateOnFocus: false, // Disable automatic revalidation on window focus
      revalidateOnReconnect: true, // Enable revalidation on reconnect
    }
  );

  return {
    address: data,
    isLoading,
    error,
  };
}
