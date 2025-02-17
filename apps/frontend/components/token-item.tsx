import { cn } from "@/lib/utils";
import Image from "next/image";

interface TokenItemProps {
  name: string;
  symbol: string;
  amount: number;
  price: number;
  priceChange: number;
  logo: string;
  onClick?: () => void;
}

export function TokenItem({
  name,
  symbol,
  amount,
  price,
  priceChange,
  logo,
  onClick,
}: TokenItemProps) {
  const isPositive = priceChange >= 0;

  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={onClick}
    >
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
          <p className="text-sm text-white/60">
            {amount.toString()} {symbol}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">
          $
          {price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p
          className={cn(
            "text-sm",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          {isPositive ? "+" : "-"}$
          {Math.abs(priceChange).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
}
