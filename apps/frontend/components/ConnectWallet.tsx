/** @format */

"use client";

import { useLaserEyes, UNISAT, XVERSE } from "@omnisat/lasereyes";
import { Button } from "@/components/ui/button";

export function ConnectWallet() {
  const { connect, disconnect, connected, hasUnisat, hasXverse } =
    useLaserEyes();

  const handleConnect = async (walletType: typeof UNISAT | typeof XVERSE) => {
    // Check if the selected wallet is installed
    if (walletType === UNISAT && !hasUnisat) {
      console.error("Please install Unisat wallet");
      return;
    }
    if (walletType === XVERSE && !hasXverse) {
      console.error("Please install Xverse wallet");
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
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={() => handleConnect(UNISAT)}
        variant="outline"
        size="lg"
        disabled={!hasUnisat}
      >
        Connect Unisat
      </Button>
      <Button
        onClick={() => handleConnect(XVERSE)}
        variant="outline"
        size="lg"
        disabled={!hasXverse}
      >
        Connect Xverse
      </Button>
    </div>
  );
}
