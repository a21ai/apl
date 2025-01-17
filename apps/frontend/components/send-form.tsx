"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Layout } from "./layout";
import { useLaserEyes } from "@/lib/hooks/useLaserEyes";
import { useBalance } from "../lib/hooks/useBalance";
import { useSigner } from "../lib/hooks/useSigner";
import { toast } from "./ui/use-toast";
import { useState } from "react";
import { archConnection } from "../lib/arch";
import {
  AssociatedTokenUtil,
  MintUtil,
  transferTx,
  waitForConfirmation,
  createMockSigner,
  readUInt64LE,
} from "@repo/apl-sdk";
import { RuntimeTransaction } from "@repo/arch-sdk/src/struct/runtime-transaction";
import { TransactionSignDrawer } from "./transaction-sign-drawer";
import { TOKEN_PROGRAMS } from "../lib/constants";

interface SendFormProps {
  token: string;
}

export function SendForm({ token }: SendFormProps): React.ReactElement {
  const router = useRouter();
  const laserEyes = useLaserEyes();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignDrawer, setShowSignDrawer] = useState(false);
  const [runtimeTx, setRuntimeTx] = useState<RuntimeTransaction | null>(null);
  const signer = useSigner();

  // Get token info from constants based on mint public key
  const hexPublicKey = laserEyes.publicKey || undefined;
  const { balances } = useBalance(hexPublicKey);

  // Handle setting max amount
  const handleMaxAmount = () => {
    if (tokenBalance) {
      const maxAmount =
        Number(tokenBalance.balance) / Math.pow(10, tokenBalance.decimals);
      setAmount(maxAmount.toString());
    }
  };

  const tokenProgram = Object.entries(TOKEN_PROGRAMS).find(
    ([programId]) => programId === token
  );

  if (!tokenProgram) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-red-500">Invalid token</p>
        </div>
      </Layout>
    );
  }

  const [programId, tokenInfo] = tokenProgram;
  const upperToken = tokenInfo.ticker.toUpperCase();

  // Find token balance
  const tokenBalance = balances?.find((b) => b.mintPubkeyHex === programId);

  const prepareTx = async () => {
    if (!laserEyes.publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Convert amount to proper decimal places
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Invalid amount");
      }

      // Convert hex public keys to Pubkey
      const senderPubkey = Buffer.from(hexPublicKey!, "hex");
      const recipientPubkey = Buffer.from(recipient, "hex");
      const mintPubkey = Buffer.from(programId, "hex");

      // Get associated token accounts for sender and recipient
      const sourceTokenPubkey = AssociatedTokenUtil.getAssociatedTokenAddress(
        mintPubkey,
        senderPubkey
      );
      const recipientTokenPubkey =
        AssociatedTokenUtil.getAssociatedTokenAddress(
          mintPubkey,
          recipientPubkey
        );

      // Verify both token accounts exist
      const sourceTokenInfo =
        await archConnection.readAccountInfo(sourceTokenPubkey);
      if (!sourceTokenInfo?.data) {
        throw new Error(
          "Source token account does not exist. Please create it first."
        );
      }

      const recipientTokenInfo =
        await archConnection.readAccountInfo(recipientTokenPubkey);
      if (!recipientTokenInfo?.data) {
        throw new Error(
          "Recipient token account does not exist. Please create it first."
        );
      }

      // Get decimals from mint
      const mintInfo = await archConnection.readAccountInfo(mintPubkey);
      if (!mintInfo?.data) {
        throw new Error("Invalid token mint account");
      }
      const mintData = MintUtil.deserialize(Buffer.from(mintInfo.data));

      // Debug logging
      console.log("=== Transaction Input Details ===");
      console.log("Sender Public Key (hex):", hexPublicKey);
      console.log("Recipient Public Key (hex):", recipient);
      console.log("Mint Public Key (hex):", programId);
      console.log("Amount Input:", amount);
      console.log("Token Decimals:", mintData.decimals);
      console.log(
        "Calculated Amount (with decimals):",
        Math.floor(amountValue * Math.pow(10, mintData.decimals))
      );
      console.log(
        "Source Token Account:",
        Buffer.from(sourceTokenPubkey).toString("hex")
      );
      console.log(
        "Recipient Token Account:",
        Buffer.from(recipientTokenPubkey).toString("hex")
      );
      console.log("=== End Transaction Input Details ===");

      // Create preview transaction with mock signer
      const mockSigner = createMockSigner();
      const previewTx = await transferTx(
        sourceTokenPubkey,
        mintPubkey,
        recipientTokenPubkey,
        senderPubkey,
        BigInt(Math.floor(amountValue * Math.pow(10, mintData.decimals))),
        mintData.decimals,
        mockSigner
      );
      setRuntimeTx(previewTx);
      setShowSignDrawer(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to prepare transaction";
      console.error(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!runtimeTx) return;

    try {
      setIsLoading(true);

      // Create real transaction with actual signer
      const realTx = await transferTx(
        Buffer.from(runtimeTx.message.instructions[0].accounts[0].pubkey), // sourceTokenPubkey
        Buffer.from(runtimeTx.message.instructions[0].accounts[1].pubkey), // mintPubkey
        Buffer.from(runtimeTx.message.instructions[0].accounts[2].pubkey), // recipientTokenPubkey
        Buffer.from(runtimeTx.message.instructions[0].accounts[3].pubkey), // senderPubkey
        readUInt64LE(
          Buffer.from(runtimeTx.message.instructions[0].data.slice(1)),
          0
        ), // amount
        runtimeTx.message.instructions[0].data[9], // decimals
        signer
      );

      const result = await archConnection.sendTransaction(realTx);
      await waitForConfirmation(archConnection, result);
      console.log("Transaction sent successfully:", result);
      setRecipient("");
      setAmount("");

      // On success, wait 2 seconds before clearing the state
      setTimeout(() => {
        setShowSignDrawer(false);

        setTimeout(() => {
          setRuntimeTx(null);
          // Clear form fields
        }, 200);
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to transfer tokens";
      console.error(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error; // Re-throw to trigger drawer error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6">
          {/* Page title and back button */}
          <div className="flex items-center -mt-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full -ml-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="flex-1 text-center text-2xl font-semibold mr-8">
              Send {upperToken}
            </h1>
          </div>

          {/* Token logo display */}
          <div className="flex justify-center py-4">
            <div className="bg-white rounded-full w-20 h-20 overflow-hidden">
              <Image
                src={tokenInfo.icon}
                alt={`${tokenInfo.name} logo`}
                width={80}
                height={80}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Send form */}
          <div className="space-y-4">
            {/* Recipient address input */}
            <div className="relative">
              <Input
                placeholder={`Recipient's ${upperToken} address`}
                className="bg-white/5 border-white/10 rounded-xl h-14 pl-4 pr-12"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Amount input with token symbol and max button */}
            <div className="relative">
              <Input
                type="number"
                placeholder="Amount"
                className="bg-white/5 border-white/10 rounded-xl h-14 pl-4 pr-24"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                min="0"
                step="any"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-white/60">{upperToken}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 bg-white/10 hover:bg-white/20 rounded-lg"
                  onClick={handleMaxAmount}
                >
                  Max
                </Button>
              </div>
            </div>

            {/* USD value and available balance display */}
            <div className="flex justify-between text-sm py-2">
              <div className="text-white/60"></div>
              <div className="text-white/60">
                Available:{" "}
                {tokenBalance
                  ? (
                      Number(tokenBalance.balance) /
                      Math.pow(10, tokenBalance.decimals)
                    ).toFixed(tokenBalance.decimals)
                  : "0"}{" "}
                {upperToken}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons fixed at bottom */}
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              className="h-12 rounded-xl"
              onClick={prepareTx}
              disabled={isLoading || !recipient || !amount}
            >
              {isLoading ? "Preparing..." : "Send"}
            </Button>
          </div>
        </div>
      </div>

      {runtimeTx && (
        <TransactionSignDrawer
          open={showSignDrawer}
          onOpenChange={setShowSignDrawer}
          account={hexPublicKey}
          website="archway.gg"
          tx={runtimeTx}
          onConfirm={handleSubmit}
        />
      )}
    </Layout>
  );
}
