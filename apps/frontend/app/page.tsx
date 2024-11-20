"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowDownToLine, Power, Coins } from 'lucide-react';
import { useLaserEyes } from "@omnisat/lasereyes";
import { useArchAddress } from "@/lib/hooks/useArchAddress";
import { ConnectWallet } from "@/components/ConnectWallet";

// Helper function to truncate addresses for display
const truncateAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

export default function Home() {
  const laserEyes = useLaserEyes();
  const isConnected = !!laserEyes.publicKey;
  const { publicKey, disconnect } = laserEyes;
  const { address } = useArchAddress(publicKey);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black p-4 md:p-8 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-pink-500/30 rounded-full blur-xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float-delayed" />
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float" />
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Keep existing header card */}
        <Card 
          className="backdrop-blur-md bg-white/10 hover:bg-black/40 border-white/20 p-4 rounded-3xl w-full cursor-pointer transition-all duration-300 ease-in-out"
          onClick={() => window.location.href = '/'}
        >
          <div className="flex justify-center items-center">
            <p className="text-white text-3xl font-bold tracking-wider">[ archway ]</p>
          </div>
        </Card>

        {!isConnected ? (
          <Card className="p-4 w-full">
            <p className="text-white text-lg font-semibold text-center mb-4">
              Connect a wallet
            </p>
            <ConnectWallet />
          </Card>
        ) : (
          <>
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 rounded-3xl">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-white/60 text-xs">Token Address</p>
                    <p className="text-white text-sm font-mono">
                      {address ? truncateAddress(address) : "..."}
                    </p>
                  </div>
                  <Power
                    className="w-5 h-5 text-gray-400 cursor-pointer transition-colors"
                    onClick={() => disconnect()}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20">
                    <img 
                      src="/stoned-cat.gif"
                      alt="Stoned Cat Token" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white uppercase font-bold">Stoner Cat</p>
                    <p className="text-white/60 text-sm">218 SCAT</p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20 rounded-full py-6"
                  variant="ghost"
                >
                  <Coins className="mr-2 h-5 w-5" /> Mint SCAT
                </Button>
              </div>
            </Card>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                className="flex-1 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20 rounded-full py-6"
                variant="ghost"
              >
                <Send className="mr-2 h-5 w-5" /> Send
              </Button>
              <Button
                className="flex-1 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20 rounded-full py-6"
                variant="ghost"
              >
                <ArrowDownToLine className="mr-2 h-5 w-5" /> Receive
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
