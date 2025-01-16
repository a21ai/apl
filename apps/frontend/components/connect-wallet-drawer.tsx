import {
  useLaserEyes,
  UNISAT,
  XVERSE,
  PHANTOM,
  OKX,
  OYL,
  MAGIC_EDEN,
} from "@omnisat/lasereyes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

// Define wallet config array with additional metadata
const WALLETS = [
  {
    type: UNISAT,
    name: "Unisat",
    logo: "/unisat.jpg",
    hasWallet: "hasUnisat",
  },
  {
    type: XVERSE,
    name: "Xverse",
    logo: "/xverse.jpg",
    hasWallet: "hasXverse",
  },
] as const;

interface ConnectWalletDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectWalletDrawer({
  open,
  onOpenChange,
}: ConnectWalletDrawerProps) {
  const {
    connect,
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
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-semibold text-center">
            Log in or sign up
          </DrawerTitle>
          <DrawerDescription className="text-center">
            Connect your wallet to get started
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6 space-y-2">
          {WALLETS.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleConnect(wallet.type)}
              disabled={!walletChecks[wallet.hasWallet]}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                  <Image
                    src={wallet.logo}
                    alt={`${wallet.name} logo`}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-white">{wallet.name}</span>
              </div>
              <Badge
                variant="secondary"
                className={
                  walletChecks[wallet.hasWallet]
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }
              >
                {walletChecks[wallet.hasWallet] ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Installed
                  </div>
                ) : (
                  "Not Installed"
                )}
              </Badge>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
