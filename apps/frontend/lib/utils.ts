import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Helper function to format token balance with decimals
export const formatTokenBalance = (
  balance: bigint,
  decimals: number
): string => {
  const balanceStr = balance.toString().padStart(decimals + 1, "0");
  const integerPart = balanceStr.slice(0, -decimals) || "0";
  const fractionalPart = balanceStr.slice(-decimals);
  return `${integerPart}${fractionalPart ? `.${fractionalPart}` : ""}`;
};
// Helper function to truncate addresses for display
export const truncateAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};
