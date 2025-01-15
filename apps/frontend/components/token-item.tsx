import { cn } from "@/lib/utils"
import Image from "next/image"

interface TokenItemProps {
  name: string
  symbol: string
  amount: string
  price: string
  priceChange: string
  logo: string
}

export function TokenItem({ name, symbol, amount, price, priceChange, logo }: TokenItemProps) {
  const isPositive = !priceChange.startsWith('-')
  
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <Image
          src={logo || "/placeholder.svg"}
          alt={`${name} logo`}
          width={40}
          height={40}
          className="rounded-full bg-white/10"
        />
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-white/60">{amount} {symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">${price}</p>
        <p className={cn(
          "text-sm",
          isPositive ? "text-white/80" : "text-white/60"
        )}>
          {isPositive ? '+' : ''}{priceChange}
        </p>
      </div>
    </div>
  )
}

