"use client";

import { QrCode, Send } from "lucide-react";
import { useLaserEyes } from "@omnisat/lasereyes";
import { TOKEN_PROGRAMS } from "@/lib/constants";
import { useBalance } from "@/lib/hooks/useBalance";
import { ConnectWalletDrawer } from "@/components/connect-wallet-drawer";
import { Layout } from "@/components/layout";
import { BalanceDisplay } from "@/components/balance-display";
import { ActionButton } from "@/components/action-button";
import { TokenItem } from "@/components/token-item";
import { TokenSelectDrawer } from "@/components/token-select-drawer";
import { ReceiveDrawer } from "@/components/receive-drawer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatTokenBalance } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const laserEyes = useLaserEyes();
  const isConnected = !!laserEyes.publicKey;
  const { publicKey } = laserEyes;
  const hexPublicKey = publicKey ? publicKey : undefined;
  const { balances, isLoading } = useBalance(hexPublicKey);
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false);
  const [receiveDrawerOpen, setReceiveDrawerOpen] = useState(false);
  const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);

  const handleTokenSelect = (programId: string) => {
    setSendDrawerOpen(false);
    router.push(`/${programId}`);
  };

  return (
    <Layout>
      <BalanceDisplay
        balance="0.00"
        change={{
          amount: "0.00",
          percentage: "0.00",
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <ActionButton
          icon={QrCode}
          label="Receive"
          onClick={() => setReceiveDrawerOpen(true)}
          disabled={!isConnected}
        />
        <ActionButton
          icon={Send}
          label="Send"
          onClick={() => setSendDrawerOpen(true)}
          disabled={!isConnected}
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

      <ConnectWalletDrawer
        open={connectDrawerOpen}
        onOpenChange={setConnectDrawerOpen}
      />

      <div className="space-y-2">
        {!isConnected ? (
          <Button
            onClick={() => setConnectDrawerOpen(true)}
            className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl"
          >
            Connect Wallet
          </Button>
        ) : isLoading ? (
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
