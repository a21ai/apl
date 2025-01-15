"use client";

import { QrCode, Send, Power } from "lucide-react";
import { useLaserEyes } from "@omnisat/lasereyes";
import { useArchAddress } from "@/lib/hooks/useArchAddress";
import { useBalance, TokenBalance } from "@/lib/hooks/useBalance";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Layout } from "@/components/layout";
import { BalanceDisplay } from "@/components/balance-display";
import { ActionButton } from "@/components/action-button";
import { TokenItem } from "@/components/token-item";

// Helper function to truncate addresses for display
const truncateAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

// Helper function to format token balance with decimals
const formatTokenBalance = (balance: bigint, decimals: number): string => {
  const balanceStr = balance.toString().padStart(decimals + 1, '0');
  const integerPart = balanceStr.slice(0, -decimals) || '0';
  const fractionalPart = balanceStr.slice(-decimals);
  return `${integerPart}${fractionalPart ? `.${fractionalPart}` : ''}`;
};

// Get SCAT token from first balance
const getScatToken = (balances?: TokenBalance[]) => {
  return balances && balances.length > 0 ? balances[0] : null;
};

export default function Home() {
  const laserEyes = useLaserEyes();
  const isConnected = !!laserEyes.publicKey;
  const { publicKey, disconnect } = laserEyes;
  const { address } = useArchAddress(publicKey);
  const { balances, isLoading, error } = useBalance(
    publicKey ? Buffer.from(publicKey).toString("hex") : undefined
  );

  if (!isConnected) {
    return (
      <Layout>
        <div className="space-y-4">
          <p className="text-white text-lg font-semibold text-center mb-4">
            Connect a wallet
          </p>
          <ConnectWallet />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header with address and disconnect */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-white/60 text-xs">Connected Address</p>
          <p className="text-white text-sm font-mono">
            {address ? truncateAddress(address) : "..."}
          </p>
        </div>
        <Power
          className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors"
          onClick={() => disconnect()}
        />
      </div>

      <BalanceDisplay
        balance="0.20"
        change={{
          amount: "0.0122",
          percentage: "6.54",
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <ActionButton icon={QrCode} label="Receive" />
        <ActionButton icon={Send} label="Send" />
      </div>

      <div className="space-y-2">
        <TokenItem
          name="Bitcoin"
          symbol="BTC"
          amount="0.20"
          price="0.20"
          priceChange="0.01"
          logo="/btc.png"
        />
        <TokenItem
          name="Stoner Cat"
          symbol="SCAT"
          amount={(() => {
            const scatToken = getScatToken(balances);
            return scatToken ? formatTokenBalance(scatToken.balance, scatToken.decimals) : "0";
          })()}
          price="0.00"
          priceChange="0.00"
          logo="/stoned-cat.gif"
        />
      </div>
    </Layout>
  );
}
