"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronsUpDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { truncateAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ConfirmationAnimation from "@/components/confirmation-animation";
import {
  RuntimeTransaction,
  Instruction,
  InstructionUtil,
} from "@repo/arch-sdk";
import { deserialize as deserializeTokenInstruction } from "@repo/apl-sdk/src/serde/token-instruction";
import {
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@repo/apl-sdk";
import { TOKEN_PROGRAMS } from "@/lib/constants";

interface TransactionSignDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: string;
  website?: string;
  tx: RuntimeTransaction;
  onConfirm: () => Promise<void>;
}

export function TransactionSignDrawer({
  open,
  onOpenChange,
  tx,
  onConfirm,
}: TransactionSignDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "waiting" | "success" | "error" | null
  >(null);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setTxStatus("waiting");
      await onConfirm();
      setTxStatus("success");
    } catch (error) {
      console.error("Transaction failed:", error);
      setTxStatus("error");
      // Keep drawer open to show error animation
      setTimeout(() => {
        setTxStatus(null);
      }, 2000);
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
          {txStatus ? (
            <div className="flex flex-col items-center justify-center p-8">
              <ConfirmationAnimation status={txStatus} />
              <p className="mt-4 text-center text-muted-foreground">
                {txStatus === "waiting"
                  ? "Confirming transaction..."
                  : txStatus === "success"
                    ? "Transaction successful!"
                    : "Transaction failed"}
              </p>
            </div>
          ) : (
            <>
              <DrawerHeader>
                <DrawerTitle>Confirm Transaction</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-4 border-b">
                <p className="text-muted-foreground text-sm">Balance changes</p>
                {tx.message.instructions.map(
                  (instruction: Instruction, i: number) => {
                    const parsedInstruction = deserializeTokenInstruction(
                      instruction.data
                    );
                    if (!parsedInstruction) {
                      return null;
                    }

                    // Find the token by checking the accounts involved in the instruction
                    const matchingToken = Object.entries(TOKEN_PROGRAMS).find(
                      ([tokenId]) => {
                        return instruction.accounts.some((account) =>
                          Buffer.from(account.pubkey)
                            .toString("hex")
                            .includes(tokenId)
                        );
                      }
                    );

                    if (!matchingToken) {
                      return null;
                    }

                    const tokenInfo = matchingToken[1];

                    // Handle different instruction types
                    let changeAmount: bigint | null = null;
                    let changeType: "positive" | "negative" = "negative";
                    const decimals = 9; // All tokens use 9 decimals

                    switch (parsedInstruction.type) {
                      case "Transfer":
                      case "TransferChecked":
                        changeAmount = BigInt(
                          parsedInstruction.info.amount.toString()
                        );
                        changeType = "negative";
                        break;
                      case "MintTo":
                        changeAmount = BigInt(
                          parsedInstruction.info.amount.toString()
                        );
                        changeType = "positive";
                        break;
                      case "Burn":
                        changeAmount = BigInt(
                          parsedInstruction.info.amount.toString()
                        );
                        changeType = "negative";
                        break;
                    }

                    if (!changeAmount) {
                      return null;
                    }

                    // Format amount with correct decimals
                    const formattedAmount = (
                      Number(changeAmount) / Math.pow(10, decimals)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: decimals,
                    });

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded-full overflow-hidden">
                            <Image
                              src={tokenInfo.icon}
                              alt={`${tokenInfo.name} icon`}
                              width={32}
                              height={32}
                            />
                          </div>
                          <span>{tokenInfo.ticker}</span>
                        </div>
                        <span
                          className={
                            changeType === "positive"
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {changeType === "positive" ? "+" : "-"}
                          {formattedAmount} {tokenInfo.ticker}
                        </span>
                      </div>
                    );
                  }
                )}
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

              <div className="p-4 space-y-4 border-b">
                <Collapsible className="w-full">
                  <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span>Advanced</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 space-y-4">
                      {tx.message.instructions.map(
                        (instruction: Instruction, i: number) => {
                          const programId = Buffer.from(
                            instruction.program_id
                          ).toString("hex");

                          console.log(programId, instruction);

                          let programType = "Unknown";

                          if (
                            programId ===
                            Buffer.from(SYSTEM_PROGRAM_ID).toString("hex")
                          ) {
                            programType = "System";
                          } else if (
                            programId ===
                            Buffer.from(TOKEN_PROGRAM_ID).toString("hex")
                          ) {
                            programType = "Token";
                          } else if (
                            programId ===
                            Buffer.from(ASSOCIATED_TOKEN_PROGRAM_ID).toString(
                              "hex"
                            )
                          ) {
                            programType = "Associated Token";
                          }

                          const instructionData =
                            InstructionUtil.toHex(instruction);
                          const parsedTokenInstruction =
                            deserializeTokenInstruction(instruction.data);

                          return (
                            <div key={i} className="space-y-2">
                              <div className="text-muted-foreground">
                                {programType} Instruction
                              </div>
                              <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-primary">Program</span>
                                  <div className="flex items-center gap-2">
                                    {programType ? (
                                      <span>{programType}</span>
                                    ) : (
                                      <span>
                                        {truncateAddress(
                                          instructionData.program_id
                                        )}
                                      </span>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4"
                                      onClick={() =>
                                        handleCopy(instructionData.program_id)
                                      }
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Data</span>
                                  <span className="text-muted-foreground">
                                    {parsedTokenInstruction
                                      ? `${parsedTokenInstruction.type}: ${JSON.stringify(parsedTokenInstruction.info)}`
                                      : instructionData.data}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="flex flex-col gap-4 p-4">
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
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
