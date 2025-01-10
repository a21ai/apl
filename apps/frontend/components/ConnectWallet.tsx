/** @format */

"use client";

import {
  useLaserEyes,
  UNISAT,
  XVERSE,
  PHANTOM,
  OKX,
  OYL,
  MAGIC_EDEN,
} from "@omnisat/lasereyes";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo } from "react";

// Define wallet config array for easier management and rendering
const WALLETS = [
  { type: UNISAT, name: "Unisat", hasWallet: "hasUnisat" },
  { type: XVERSE, name: "Xverse", hasWallet: "hasXverse" },
  { type: PHANTOM, name: "Phantom", hasWallet: "hasPhantom" },
  { type: OKX, name: "OKX", hasWallet: "hasOkx" },
  { type: OYL, name: "OYL", hasWallet: "hasOyl" },
  { type: MAGIC_EDEN, name: "Magic Eden", hasWallet: "hasMagicEden" },
] as const;

export function ConnectWallet() {
  const {
    connect,
    disconnect,
    connected,
    hasUnisat,
    hasXverse,
    hasPhantom,
    hasOkx,
    hasOyl,
    hasMagicEden,
  } = useLaserEyes();

  // Create a map of wallet availability checks
  const walletChecks = useMemo(() => ({
    hasUnisat,
    hasXverse,
    hasPhantom,
    hasOkx,
    hasOyl,
    hasMagicEden,
  }), [hasUnisat, hasXverse, hasPhantom, hasOkx, hasOyl, hasMagicEden]);

  // Attempt to auto-connect on mount if we have a stored wallet type
  useEffect(() => {
    const storedWallet = localStorage.getItem("walletType");
    if (!connected && storedWallet) {
      // Find the wallet config to verify it's still installed
      const wallet = WALLETS.find((w) => w.type === storedWallet);
      if (wallet && walletChecks[wallet.hasWallet]) {
        connect(wallet.type).catch((err) => {
          console.error("Auto-connect failed:", err);
          localStorage.removeItem("walletType");
        });
      } else {
        // Wallet is no longer installed, clear storage
        localStorage.removeItem("walletType");
      }
    }
  }, [connected, connect, walletChecks]);

  const handleConnect = async (
    walletType: (typeof WALLETS)[number]["type"]
  ) => {
    // Find the wallet config
    const wallet = WALLETS.find((w) => w.type === walletType);
    if (!wallet) return;

    // Check if the selected wallet is installed
    if (!walletChecks[wallet.hasWallet]) {
      console.error(`Please install ${wallet.name} wallet`);
      return;
    }

    try {
      await connect(walletType);
      localStorage.setItem("walletType", walletType);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      localStorage.removeItem("walletType");
    }
  };

  if (connected) {
    return (
      <Button 
        onClick={() => {
          disconnect();
          localStorage.removeItem("walletType");
        }} 
        variant="outline" 
        size="lg"
      >
        Disconnect
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {WALLETS.map((wallet) => (
        <Button
          key={wallet.name}
          onClick={() => handleConnect(wallet.type)}
          variant="ghost"
          disabled={!walletChecks[wallet.hasWallet]}
          className="flex-1 bg-white/10 hover:bg-black/40 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20 w-full"
        >
          Connect {wallet.name}
        </Button>
      ))}
    </div>
  );
}
