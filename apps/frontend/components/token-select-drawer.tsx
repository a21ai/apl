import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { TokenItem } from "@/components/token-item";
import { TOKEN_PROGRAMS } from "@/lib/constants";
import { formatTokenBalance } from "@/lib/utils";

interface TokenSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances?: {
    mintPubkeyHex: string;
    balance: bigint;
    decimals: number;
  }[];
  onSelectToken: (programId: string) => void;
}

export function TokenSelectDrawer({
  open,
  onOpenChange,
  balances,
  onSelectToken,
}: TokenSelectDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Select Token to Send</DrawerTitle>
          <DrawerDescription>
            Choose a token from your available balance
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-2">
          {Object.entries(TOKEN_PROGRAMS).map(([programId, metadata]) => {
            const token = balances?.find((b) => b.mintPubkeyHex === programId);
            return (
              <div
                key={programId}
                onClick={() => onSelectToken(programId)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <TokenItem
                  name={metadata.name}
                  symbol={metadata.ticker}
                  amount={
                    token
                      ? formatTokenBalance(token.balance, token.decimals)
                      : "0"
                  }
                  price="0.00"
                  priceChange="0.00"
                  logo={metadata.icon}
                />
              </div>
            );
          })}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
