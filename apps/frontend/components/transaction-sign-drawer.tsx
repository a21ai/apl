"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronsUpDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { truncateAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/components/ui/use-toast";
interface TransactionData {
  programId: string;
  data: string;
}

interface TransactionSignDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: string;
  website?: string;
  transactions: {
    token: string;
    amount: string;
    change: "positive" | "negative";
    icon?: string;
  }[];
  advanced?: TransactionData[];
  onConfirm: () => Promise<void>;
}

export function TransactionSignDrawer({
  open,
  onOpenChange,
  account = "Account 1",
  website = "archway.io",
  transactions = [],
  advanced = [],
  onConfirm,
}: TransactionSignDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Transaction confirmed successfully",
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to confirm transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md">
        <div className="w-full max-w-md mx-auto">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                {account ? truncateAddress(account).slice(0, 2) : "A1"}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Confirm Transaction</h2>
                <p className="text-muted-foreground">{website}</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Balance changes are estimated. Amounts and assets involved are not
              guaranteed.
            </p>
          </div>

          <div className="p-4 space-y-4 border-b">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full overflow-hidden">
                    {tx.icon ? (
                      <Image
                        src={tx.icon}
                        alt={`${tx.token} icon`}
                        width={32}
                        height={32}
                      />
                    ) : null}
                  </div>
                  <span>{tx.token}</span>
                </div>
                <span
                  className={
                    tx.change === "positive"
                      ? "text-green-500"
                      : "text-destructive"
                  }
                >
                  {tx.change === "positive" ? "+" : "-"}
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 space-y-4 border-b">
            <div className="flex justify-between items-center">
              <span>Network</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden">
                  <Image
                    src="/arch.png"
                    alt="Arch Network"
                    width={20}
                    height={20}
                  />
                </div>
                <span>Arch</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Network Fee</span>
              <span className="text-muted-foreground">0.00 ARCH</span>
            </div>
          </div>

          {advanced && advanced.length > 0 && (
            <Collapsible className="w-full">
              <div className="px-4 py-2 border-b">
                <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground">
                  <ChevronsUpDown className="h-4 w-4" />
                  Advanced
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="p-4 space-y-6">
                  {advanced.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-muted-foreground">Unknown</div>
                      <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-primary">Program Id</span>
                          <div className="flex items-center gap-2">
                            <span>{truncateAddress(item.programId)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => handleCopy(item.programId)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Data</span>
                          <span className="text-muted-foreground">
                            {item.data}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="flex flex-col gap-4 p-4">
            <p className="text-muted-foreground text-center">
              Only confirm if you trust this website.
            </p>
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Confirming..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
