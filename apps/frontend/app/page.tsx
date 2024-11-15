"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight } from "lucide-react";
import { useLaserEyes } from "@omnisat/lasereyes";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useArchAddress } from "@/lib/hooks/useArchAddress";
import { useProgramAccounts } from "@/lib/hooks/useProgramAccounts";

const tokens = [
  {
    name: "NUSD",
    symbol: "NUSD",
    balance: "2,180.00",
    value: 2180.0,
    change: 0.0,
    icon: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Arch",
    symbol: "ARCH",
    balance: "0.97646",
    value: 208.06,
    change: 3.57,
    icon: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Saturn",
    symbol: "SAT",
    balance: "1.00",
    value: 312.83,
    change: 15.64,
    icon: "/placeholder.svg?height=32&width=32",
  },
];

export default function Home() {
  const laserEyes = useLaserEyes();
  const isConnected = !!laserEyes.publicKey;
  const { publicKey } = laserEyes;
  const { address } = useArchAddress(publicKey);
  const { accounts } = useProgramAccounts(publicKey);
  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-xl">
          <CardContent className="space-y-6 pt-6 text-center">
            <h2 className="text-2xl font-bold">Welcome to Your Wallet</h2>
            <p className="text-muted-foreground">
              Connect your wallet to get started
            </p>
            <ConnectWallet />
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("Public Key", publicKey);
  console.log("Address", address);
  console.log("Accounts", accounts);
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-xl">
        <CardContent className="space-y-6 pt-6">
          <div className="text-center space-y-2">
            <p className="text-5xl font-bold">$2,700.89</p>
            <p className="text-lg text-green-500">+$19.21 +0.72%</p>
            <div className="flex items-center justify-center gap-2">
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                {address ? address : "..."}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="flex flex-col items-center justify-center h-20"
              variant="outline"
            >
              <Copy className="h-5 w-5 mb-1" />
              <span className="text-xs">Receive</span>
            </Button>
            <Button
              className="flex flex-col items-center justify-center h-20"
              variant="outline"
            >
              <ArrowUpRight className="h-5 w-5 mb-1" />
              <span className="text-xs">Send</span>
            </Button>
          </div>

          <div className="space-y-2 pt-4">
            {tokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={token.icon}
                    alt={token.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{token.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {token.balance} {token.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${token.value.toFixed(2)}</p>
                  <p className={`text-sm text-green-500`}>
                    +${token.change.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
