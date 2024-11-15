/** @format */

"use client";

import { useLaserEyes, UNISAT } from "@omnisat/lasereyes";
import { Button } from "@/components/ui/button";

export function ConnectWallet() {
  const { connect, disconnect, connected, hasUnisat } = useLaserEyes();

  const handleConnect = async () => {
    if (!hasUnisat) {
      console.error("Please install Unisat wallet");
      return;
    }
    await connect(UNISAT);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={connected ? disconnect : handleConnect}
        variant="outline"
        size="lg"
      >
        {connected ? "Disconnect" : "Connect Wallet"}
      </Button>
    </div>
  );
}
