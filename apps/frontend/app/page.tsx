"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLaserEyes } from "@omnisat/lasereyes";
import { useArchAddress } from "@/lib/hooks/useArchAddress";
import { useProgramAccounts } from "@/lib/hooks/useProgramAccounts";

// Helper function to truncate addresses for display
const truncateAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

export default function Home() {
  const laserEyes = useLaserEyes();
  const isConnected = !!laserEyes.publicKey;
  const { publicKey } = laserEyes;
  const { address } = useArchAddress(publicKey);
  const { accounts } = useProgramAccounts(publicKey);

  // Keep the existing not-connected state
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
              <Button>Connect Wallet</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black p-4 md:p-8 relative overflow-hidden">
      {/* Floating Elements - keeping existing animation elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-pink-500/30 rounded-full blur-xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float-delayed" />
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float" />
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 rounded-3xl">
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-white/60 text-xs">BTC Address</p>
              <p className="text-white text-sm font-mono">
                {address ? truncateAddress(address) : "..."}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Token Address</p>
              <p className="text-white text-sm font-mono">
                {publicKey ? truncateAddress(publicKey.toString()) : "..."}
              </p>
            </div>
          </div>

          <div>
            <p className="text-white/60 text-sm">Available Balance</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-3xl font-semibold">2,450</p>
              {/* Arch Logo SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 163 118"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                {/* ... SVG paths from the example ... */}
              </svg>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              className="flex-1 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20"
              variant="ghost"
            >
              Send
            </Button>
            <Button
              className="flex-1 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20"
              variant="ghost"
            >
              Receive
            </Button>
          </div>
        </Card>

        <Card className="backdrop-blur-md bg-white/10 border-white/20 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white text-xl">Token Balances</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20">
                  <img
                    src="/stoned-cat.gif"
                    alt="Stoned Cat Token"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white font-semibold">218 Stoned Cat</p>
                  <p className="text-white/60 text-sm">$436.00 USD</p>
                </div>
              </div>
              <Button
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20"
                variant="ghost"
              >
                Mint Tokens
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keeping existing animation styles */}
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
