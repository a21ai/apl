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
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black p-4 md:p-8 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-pink-500/30 rounded-full blur-xl animate-float" />
          <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float-delayed" />
          <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float" />
        </div>

        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 w-full max-w-xl">
            <CardContent className="space-y-6 pt-6 text-center">
              <h2 className="text-2xl font-bold text-white">
                Welcome to Your Wallet
              </h2>
              <p className="text-white/60">
                Connect your wallet to get started
              </p>
              <ConnectWallet />
            </CardContent>
          </Card>
        </div>
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black p-4 md:p-8 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-pink-500/30 rounded-full blur-xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float-delayed" />
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float" />
      </div>

      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 w-full max-w-xl">
          <CardContent className="space-y-6 pt-6">
            <div className="text-center space-y-2">
              <p className="text-5xl font-bold text-white">$2,700.89</p>
              <p className="text-lg text-green-400">+$19.21 +0.72%</p>
              <div className="flex items-center justify-center gap-2">
                <code className="relative rounded bg-white/5 px-[0.3rem] py-[0.2rem] font-mono text-sm text-white/80">
                  {address ? address : "..."}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={copyAddress}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                className="flex flex-col items-center justify-center h-20 bg-white/5 hover:bg-white/10 text-white border-white/10"
                variant="outline"
              >
                <Copy className="h-5 w-5 mb-1" />
                <span className="text-xs">Receive</span>
              </Button>
              <Button
                className="flex flex-col items-center justify-center h-20 bg-white/5 hover:bg-white/10 text-white border-white/10"
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
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={token.icon}
                      alt={token.name}
                      className="w-8 h-8 rounded-full bg-white/10"
                    />
                    <div>
                      <h3 className="font-medium text-white">{token.name}</h3>
                      <p className="text-sm text-white/60">
                        {token.balance} {token.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      ${token.value.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-400">
                      +${token.change.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes float-delayed {
          0% {
            transform: translateY(-20px);
          }
          50% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
