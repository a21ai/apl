"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { createAssociatedTokenAccountTx, transferTx } from "@repo/apl-token";
import { RuntimeTransaction } from "@saturnbtcio/arch-sdk";
import { HARDCODED_TOKEN_ID } from "../lib/constants";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface TokenAccountControlsProps {
  walletAddress: string;
}

export function TokenAccountControls({ walletAddress }: TokenAccountControlsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleCreateTokenAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mockSigner = async (tx: RuntimeTransaction) => tx;
      const walletPubkey = Buffer.from(walletAddress);
      const tokenPubkey = Buffer.from(HARDCODED_TOKEN_ID);
      
      const tx = await createAssociatedTokenAccountTx(
        walletPubkey,
        tokenPubkey,
        walletPubkey,
        mockSigner
      );
      
      console.log("Create ATA transaction:", tx);
    } catch (err) {
      setError("Failed to create token account");
      console.error("Error creating token account:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleCreateTokenAccount}
        disabled={loading}
        variant="ghost"
        className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20 rounded-full py-6 mt-4"
      >
        Create Token Account
      </Button>

      <Dialog id="send-modal">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 rounded-3xl">
          <h2 className="text-xl font-semibold mb-4 text-white">Send Tokens</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-white/60">Recipient Address</Label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/60">Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            {error && <p className="text-red-400">{error}</p>}
            <Button
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  
                  const mockSigner = async (tx: RuntimeTransaction) => tx;
                  const senderAddress = Buffer.from(walletAddress);
                  const recipientBuffer = Buffer.from(recipient);
                  
                  const tx = await transferTx(
                    senderAddress,
                    recipientBuffer,
                    BigInt(amount),
                    senderAddress,
                    mockSigner
                  );
                  
                  console.log("Transfer transaction:", tx);
                  (document.getElementById('send-modal') as HTMLDialogElement)?.close();
                } catch (err) {
                  setError("Failed to send tokens");
                  console.error("Error sending tokens:", err);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              variant="ghost"
              className="w-full bg-white/10 hover:bg-white/20 text-white"
            >
              Send
            </Button>
          </div>
        </Card>
      </Dialog>

      <Dialog id="receive-modal">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 rounded-3xl">
          <h2 className="text-xl font-semibold mb-4 text-white">Receive Tokens</h2>
          <div className="space-y-4">
            <p className="text-white/60">Your Token Account Address:</p>
            <p className="font-mono text-sm break-all text-white">{walletAddress}</p>
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(walletAddress);
                (document.getElementById('receive-modal') as HTMLDialogElement)?.close();
              }}
              variant="ghost"
              className="w-full bg-white/10 hover:bg-white/20 text-white"
            >
              Copy Address
            </Button>
          </div>
        </Card>
      </Dialog>
    </>
  );
}
