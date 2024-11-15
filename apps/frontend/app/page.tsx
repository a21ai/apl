"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLaserEyes } from "@omnisat/lasereyes";
import { useArchAddress } from "@/lib/hooks/useArchAddress";
import { useProgramAccounts } from "@/lib/hooks/useProgramAccounts";
import { useState } from "react"; 
import { Power } from "lucide-react";

// Helper function to truncate addresses for display
const truncateAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

export default function Home() {
  const [manuallySignedIn, setManuallySignedIn] = useState(false);
  const laserEyes = useLaserEyes();
  const isConnected = manuallySignedIn || !!laserEyes.publicKey;
  const { publicKey } = laserEyes;
  const { address } = useArchAddress(publicKey);
  const { accounts } = useProgramAccounts(publicKey);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black p-4 md:p-8 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-48 h-48 bg-pink-500/30 rounded-full blur-2xl animate-float" />
        <div className="absolute top-[25%] right-[25%] w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute bottom-[30%] left-[30%] w-56 h-56 bg-purple-500/20 rounded-full blur-2xl animate-float" />
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Logo Card */}
        <Card 
          className="backdrop-blur-md bg-white/10 border-white/20 p-4 rounded-3xl cursor-pointer transition-all duration-300 ease-in-out hover:bg-black/40"
          onClick={() => window.location.href = '/'}
        >
          <div className="flex justify-center items-center">
            <h1 className="text-white font-bold text-2xl tracking-wider">[ archway ]</h1>
          </div>
        </Card>

        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 rounded-3xl">
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-white/60 text-xs">BTC Address</p>
              <p className="text-white text-sm font-mono">
                {isConnected ? (address ? truncateAddress(address) : "...") : "Not Connected"}
              </p>
            </div>
            <div className="flex items-center justify-center w-6">
              <Power 
                className={`w-6 h-6 ${isConnected ? 'text-green-500' : 'text-red-500'} cursor-pointer transition-colors`}
                onClick={() => setManuallySignedIn(!manuallySignedIn)}
              />
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Token Address</p>
              <p className="text-white text-sm font-mono">
                {isConnected ? (publicKey ? truncateAddress(publicKey.toString()) : "...") : "Not Connected"}
              </p>
            </div>
          </div>

          {isConnected ? (
            <>
              <div>
                <div className="flex items-center text-center justify-center">
                  <p className="text-white text-4xl text-center font-semibold">2,450</p>
                </div>
                <p className="text-white/60 text-xs mt-1 text-center">Available Balance</p>
              </div>

              <div className="flex gap-4 mt-6">
                <Button className="flex-1 bg-white/10 hover:bg-black/40 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20" variant="ghost">
                  Send
                </Button>
                <Button className="flex-1 bg-white/10 hover:bg-black/40 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20" variant="ghost">
                  Receive
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <Button 
                className="w-full bg-white/10 hover:bg-black/40 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20"
                onClick={() => setManuallySignedIn(true)}
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </Card>

        {/* Token Balances Card - Only show when connected */}
        {isConnected && (
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
        )}
      </div>

      {/* Keeping existing animation styles */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-25px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes float-delayed {
          0% {
            transform: translateY(-25px);
          }
          50% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-25px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
