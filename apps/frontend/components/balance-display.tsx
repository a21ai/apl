interface BalanceDisplayProps {
  balance: string
  change: {
    amount: string
    percentage: string
  }
}

export function BalanceDisplay({ balance, change }: BalanceDisplayProps) {
  const isPositive = !change.amount.startsWith('-')
  
  return (
    <div className="text-center space-y-2 py-8">
      <h1 className="text-6xl font-bold tracking-tighter">
        ${balance}
      </h1>
      <div className="flex items-center justify-center gap-2 text-white/80">
        <span>+${change.amount}</span>
        <span>+{change.percentage}%</span>
      </div>
    </div>
  )
}

