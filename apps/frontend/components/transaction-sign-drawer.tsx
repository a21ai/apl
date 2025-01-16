"use client";

import * as React from "react";
import { useState } from "react";
import { Copy, ChevronsUpDown, ExternalLink } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

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
  }[];
  network: {
    name: string;
    fee: string;
  };
  advanced?: TransactionData[];
  onConfirm: () => Promise<void>;
}

export function TransactionSignDrawer({
  open,
  onOpenChange,
  account = "Account 1",
  website = "archway.io",
  transactions = [],
  network,
  advanced = [],
  onConfirm,
}: TransactionSignDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Transaction failed:", error);
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
          <DrawerHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                A1
              </div>
              <div className="flex-1">{account}</div>
              <Button variant="ghost" size="icon" onClick={() => handleCopy(account)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="p-4 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 relative">
                  <div className="w-full h-full bg-muted rounded-full" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Confirm Transaction</h2>
                <p className="text-muted-foreground">{website}</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Balance changes are estimated. Amounts and assets involved are not guaranteed.
            </p>
          </div>

          <div className="p-4 space-y-4 border-b">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <span>{tx.token}</span>
                </div>
                <span className={tx.change === "positive" ? "text-green-500" : "text-destructive"}>
                  {tx.change === "positive" ? "+" : "-"}{tx.amount}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 space-y-4 border-b">
            <div className="flex justify-between items-center">
              <span>Network</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-muted rounded-full" />
                <span>{network.name}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Network Fee</span>
              <span className="text-muted-foreground">{network.fee}</span>
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
                            <span>{item.programId}</span>
                            <Button variant="ghost" size="icon" className="h-4 w-4">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Data</span>
                          <span className="text-muted-foreground">{item.data}</span>
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
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
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
