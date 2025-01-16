import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ReceiveDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
}

export function ReceiveDrawer({
  open,
  onOpenChange,
  address,
}: ReceiveDrawerProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Receive</DrawerTitle>
        </DrawerHeader>
        <div className="p-6 space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl">
              <QRCodeSVG value={address} size={200} />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <p className="text-white/60 text-sm">Your Address</p>
            <div
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              onClick={handleCopy}
            >
              <p className="text-sm font-mono">{address}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">
                  {showCopied ? "Copied!" : ""}
                </span>
                <Copy className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
