interface BalanceDisplayProps {
  balance: number;
  change: {
    amount: number;
    percentage: number;
  };
}

export function BalanceDisplay({ balance, change }: BalanceDisplayProps) {
  const isAmountPositive = change.amount >= 0;
  const isPercentagePositive = change.percentage >= 0;

  return (
    <div className="text-center space-y-2 py-8">
      <h1 className="text-6xl font-bold tracking-tighter">
        $
        {balance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </h1>
      <div className="flex items-center justify-center gap-2">
        <span className={isAmountPositive ? "text-green-500" : "text-red-500"}>
          {isAmountPositive ? "+" : "-"}$
          {Math.abs(change.amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span
          className={isPercentagePositive ? "text-green-500" : "text-red-500"}
        >
          {isPercentagePositive ? "+" : "-"}
          {Math.abs(change.percentage).toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
