"use client";

import { useEffect } from "react";
import { QrCode, Send, Gift } from "lucide-react";
import { useLaserEyes } from "@/lib/hooks/useLaserEyes";
import { TOKEN_PROGRAMS } from "@/lib/constants";
import { useBalance } from "@/lib/hooks/useBalance";
import { useExchangeRate } from "@/lib/hooks/useExchangeRate";
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
import { mintScat } from "./actions";
import { toast } from "@/components/ui/use-toast";
import { waitForConfirmationWithToast } from "@/lib/wait-for-confirmation";

import "@/app/globals.css";

export default function Home() {
  const router = useRouter();
  const laserEyes = useLaserEyes();
  const { price, percentChange24h } = useExchangeRate();
  const isConnected = !!laserEyes.publicKey;
  const { publicKey } = laserEyes;
  const { balances, isLoading, isInitialized, initializeWallet, mutate } =
    useBalance(publicKey);
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false);
  const [receiveDrawerOpen, setReceiveDrawerOpen] = useState(false);
  const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // Find BTC token ID from TOKEN_PROGRAMS
  const btcTokenId = Object.keys(TOKEN_PROGRAMS).find(
    // @ts-ignore
    (token) => TOKEN_PROGRAMS[token].ticker === "BTC"
  );

  // Find SCAT token ID from TOKEN_PROGRAMS
  const scatTokenId = Object.keys(TOKEN_PROGRAMS).find(
    // @ts-ignore
    (token) => TOKEN_PROGRAMS[token].ticker === "SCAT"
  );

  // Find BTC balance from tokens list
  const btcBalance = btcTokenId
    ? balances.find((b) => b.mintPubkeyHex === btcTokenId)
    : undefined;

  // Calculate total USD value including both BTC and SCAT
  const totalUsdValue = balances.reduce((total, token) => {
    const amount = Number(formatTokenBalance(token.balance, token.decimals));
    if (token.mintPubkeyHex === btcTokenId && price) {
      // BTC value
      return total + amount * price;
    } else if (token.mintPubkeyHex === scatTokenId) {
      // SCAT value (fixed at $0.42069)
      return total + amount * 0.42069;
    }
    return total;
  }, 0);

  // Calculate dollar value change based on BTC holdings only
  const totalDollarValueChange =
    btcBalance && price && percentChange24h
      ? Number(formatTokenBalance(btcBalance.balance, btcBalance.decimals)) *
        price *
        (percentChange24h / 100)
      : 0;

  const handleTokenSelect = (programId: string) => {
    setSendDrawerOpen(false);
    router.push(`/${programId}`);
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeWallet();
    } finally {
      // isInitializing will be set to false by the useEffect when publicKey changes
    }
  };

  // Reset isInitializing when publicKey changes
  useEffect(() => {
    setIsInitializing(false);
  }, [publicKey]);

  const handleFreeMint = async () => {
    if (!publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMinting(true);
      const result = await mintScat(publicKey);
      setIsMinting(false);
      await waitForConfirmationWithToast(result.txId!);
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to mint tokens",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <BalanceDisplay
        balance={totalUsdValue}
        change={{
          amount: totalDollarValueChange,
          percentage: percentChange24h ?? 0,
        }}
      />

      <div className="grid grid-cols-3 gap-4">
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
        <ActionButton
          icon={Gift}
          label={isMinting ? "Minting..." : "Free SCAT"}
          onClick={handleFreeMint}
          disabled={!isConnected || isMinting}
        />
      </div>

      <TokenSelectDrawer
        open={sendDrawerOpen}
        onOpenChange={setSendDrawerOpen}
        balances={balances}
        onSelectToken={handleTokenSelect}
      />

      {publicKey && (
        <ReceiveDrawer
          open={receiveDrawerOpen}
          onOpenChange={setReceiveDrawerOpen}
          address={publicKey}
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
            <div className="h-16 bg-white/10 rounded-2xl" />
          </div>
        ) : !isInitialized ? (
          <Button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInitializing ? "Initializing..." : "Initialize Account"}
          </Button>
        ) : (
          Object.entries(TOKEN_PROGRAMS).map(([programId, metadata]) => {
            const token = balances?.find((b) => b.mintPubkeyHex === programId);
            const tokenAmount = token
              ? Number(formatTokenBalance(token.balance, token.decimals))
              : 0;

            // Calculate dollar value change for BTC based on holdings
            const dollarValueChange =
              metadata.ticker === "BTC" && price && percentChange24h
                ? tokenAmount * price * (percentChange24h / 100)
                : 0;

            return (
              <TokenItem
                key={programId}
                name={metadata.name}
                symbol={metadata.ticker}
                amount={tokenAmount}
                price={
                  metadata.ticker === "BTC"
                    ? tokenAmount * (price ?? 0)
                    : metadata.ticker === "SCAT"
                      ? tokenAmount * 0.42069 // SCAT tokens fixed at $1 each
                      : 0
                }
                priceChange={metadata.ticker === "BTC" ? dollarValueChange : 0}
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
