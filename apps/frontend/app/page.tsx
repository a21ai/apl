"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLaserEyes } from "@omnisat/lasereyes";
import { useArchAddress } from "@/lib/hooks/useArchAddress";
import { useProgramAccounts } from "@/lib/hooks/useProgramAccounts";
import { Power } from "lucide-react";
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
  const { accounts } = useProgramAccounts(publicKey);

  console.log("Accounts", accounts);
  console.log("Is Connected", isConnected);

  return (
    <div className="max-w-xl mx-auto space-y-4 flex flex-col justify-center items-center h-full min-h-screen">
      {!isConnected ? (
        <Card className="p-4 w-full">
          <p className="text-white text-lg font-semibold text-center mb-4">
            Connect a wallet
          </p>
          <ConnectWallet />
        </Card>
      ) : (
        <>
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 rounded-3xl w-full">
            <div className="flex justify-between mb-6 ">
              <div>
                <p className="text-white/60 text-xs">Token Address</p>
                <p className="text-white text-sm font-mono">
                  {isConnected
                    ? address
                      ? truncateAddress(address)
                      : "..."
                    : "Not Connected"}
                </p>
              </div>
              <div className="flex items-center justify-center w-6">
                <Power
                  className={`w-6 h-6 ${isConnected ? "text-green-500" : "text-red-500"} cursor-pointer transition-colors`}
                  onClick={() => disconnect()}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center text-center justify-center">
                <p className="text-white text-4xl text-center font-semibold">
                  2,450
                </p>
              </div>
              <p className="text-white/60 text-xs mt-1 text-center">
                Available Balance
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                className="flex-1 bg-white/10 hover:bg-black/40 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20"
                variant="ghost"
              >
                Send
              </Button>
              <Button
                className="flex-1 bg-white/10 hover:bg-black/40 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20"
                variant="ghost"
              >
                Receive
              </Button>
            </div>
          </Card>

          {/* Token Balances Card - Only show when connected */}
          {isConnected && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 rounded-3xl overflow-hidden w-full">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white text-xl">
                  Token Balances
                </CardTitle>
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
                      <p className="text-white font-semibold">Stoned Cat</p>
                      <p className="text-white/60 text-sm">218 SCAT</p>
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
        </>
      )}
    </div>
  );
}
