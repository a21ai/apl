"use client";

import { QrCode, Send, Power } from "lucide-react";
import { useLaserEyes } from "@omnisat/lasereyes";
import { TOKEN_PROGRAMS } from "@/lib/constants";
import { useBalance } from "@/lib/hooks/useBalance";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Layout } from "@/components/layout";
import { BalanceDisplay } from "@/components/balance-display";
import { ActionButton } from "@/components/action-button";
import { TokenItem } from "@/components/token-item";
import { TokenSelectDrawer } from "@/components/token-select-drawer";
import { ReceiveDrawer } from "@/components/receive-drawer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatTokenBalance } from "@/lib/utils";
// Helper function to truncate addresses for display
const truncateAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

export default function Home() {
  const router = useRouter();
  const laserEyes = useLaserEyes();
  const isConnected = !!laserEyes.publicKey;
  const { publicKey, disconnect } = laserEyes;
  const hexPublicKey = publicKey ? publicKey : undefined;
  const { balances, isLoading } = useBalance(hexPublicKey);
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false);
  const [receiveDrawerOpen, setReceiveDrawerOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

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

  const handleTokenSelect = (programId: string) => {
    setSendDrawerOpen(false);
    router.push(`/${programId}`);
  };

  const handleCopyAddress = () => {
    if (hexPublicKey) {
      navigator.clipboard.writeText(hexPublicKey);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  console.log(publicKey);

  return (
    <Layout>
      {/* Header with address and disconnect */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-white/60 text-xs">Connected Address</p>
          <p
            onClick={handleCopyAddress}
            className="text-white text-sm font-mono hover:text-white/80 cursor-pointer transition-colors"
          >
            {showCopied
              ? "Copied!"
              : hexPublicKey
                ? truncateAddress(hexPublicKey)
                : "..."}
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
        <ActionButton
          icon={QrCode}
          label="Receive"
          onClick={() => setReceiveDrawerOpen(true)}
        />
        <ActionButton
          icon={Send}
          label="Send"
          onClick={() => setSendDrawerOpen(true)}
        />
      </div>

      <TokenSelectDrawer
        open={sendDrawerOpen}
        onOpenChange={setSendDrawerOpen}
        balances={balances}
        onSelectToken={handleTokenSelect}
      />

      {hexPublicKey && (
        <ReceiveDrawer
          open={receiveDrawerOpen}
          onOpenChange={setReceiveDrawerOpen}
          address={hexPublicKey}
        />
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-white/10 rounded-2xl" />
            <div className="h-16 bg-white/10 rounded-2xl" />
          </div>
        ) : (
          Object.entries(TOKEN_PROGRAMS).map(([programId, metadata]) => {
            const token = balances?.find((b) => b.mintPubkeyHex === programId);
            return (
              <TokenItem
                key={programId}
                name={metadata.name}
                symbol={metadata.ticker}
                amount={
                  token
                    ? formatTokenBalance(token.balance, token.decimals)
                    : "0"
                }
                price="0.00" // TODO: Implement price fetching
                priceChange="0.00" // TODO: Implement price change tracking
                logo={metadata.icon}
                onClick={() => router.push(`/${programId}`)}
              />
            );
          })
        )}
      </div>
    </Layout>
  );
}
