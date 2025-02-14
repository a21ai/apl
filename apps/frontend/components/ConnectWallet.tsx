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
  const walletChecks = {
    hasUnisat,
    hasXverse,
    hasPhantom,
    hasOkx,
    hasOyl,
    hasMagicEden,
  };

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
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  if (connected) {
    return (
      <Button onClick={disconnect} variant="outline" size="lg">
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
