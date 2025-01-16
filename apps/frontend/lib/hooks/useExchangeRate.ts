import useSWR from "swr";

interface ExchangeRateData {
  price: number;
  percent_change_24h: number;
}

const EXCHANGE_RATE_API =
  "https://cloud-functions.twetch.app/api/btc-exchange-rate";

/**
 * Custom hook to fetch and manage BTC exchange rate data
 * @returns Object containing exchange rate data, loading state, and error state
 */
export function useExchangeRate() {
  const fetcher = async (url: string): Promise<ExchangeRateData> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate");
    }
    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR(
    EXCHANGE_RATE_API,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    price: data?.price,
    percentChange24h: data?.percent_change_24h,
    isLoading,
    error,
    mutate,
  };
}
