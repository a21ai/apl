import { useBalance } from "@/lib/hooks/useBalance";
// Token programs import not needed here
import { formatTokenBalance } from "@/app/page";

interface BalanceDisplayProps {
  publicKey?: string;
}

export function BalanceDisplay({ publicKey }: BalanceDisplayProps) {
  const { balances, isLoading, error } = useBalance(publicKey);
  
  // Calculate total balance from all tokens
  const totalBalance = balances?.reduce((total, token) => {
    // For now, we're just summing up the raw balances
    // In a real app, we'd multiply by token price
    const formattedBalance = Number(formatTokenBalance(token.balance, token.decimals));
    return total + formattedBalance;
  }, 0) ?? 0;

  if (error) {
    return (
      <div className="text-center space-y-2 py-8">
        <h1 className="text-6xl font-bold tracking-tighter text-red-500">
          Error
        </h1>
        <p className="text-white/60">Failed to load balances</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="text-center space-y-2 py-8">
        <h1 className="text-6xl font-bold tracking-tighter animate-pulse">
          Loading...
        </h1>
      </div>
    );
  }
  
  return (
    <div className="text-center space-y-2 py-8">
      <h1 className="text-6xl font-bold tracking-tighter">
        ${totalBalance.toFixed(2)}
      </h1>
      <div className="flex items-center justify-center gap-2 text-white/80">
        <span>+$0.00</span>
        <span>+0.00%</span>
      </div>
    </div>
  )
}

