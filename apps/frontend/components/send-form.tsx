"use client";

import * as React from "react";
import { ArrowLeft, AtSign } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Layout } from "./layout";
import { TOKEN_PROGRAMS } from "../lib/constants";
import { useLaserEyes } from "@omnisat/lasereyes";
import { useBalance } from "../lib/hooks/useBalance";
import { useSigner } from "../lib/hooks/useSigner";
import { toast } from "./ui/use-toast";
import { useState } from "react";
import { archConnection } from "../lib/arch";
import { 
  AssociatedTokenUtil,
  MintUtil,
  transferTx,
} from "@repo/apl-sdk";

type TokenInfo = {
  name: string;
  ticker: string;
  icon: string;
};

interface SendFormProps {
  token: string;
}

export function SendForm({ token }: SendFormProps): React.ReactElement {
  const router = useRouter();
  const upperToken = token.toUpperCase();
  const laserEyes = useLaserEyes();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get token info from constants
  const hexPublicKey = laserEyes.publicKey 
    ? Buffer.from(laserEyes.publicKey).toString("hex")
    : undefined;
  const { balances } = useBalance(hexPublicKey);

  const tokenProgram = Object.entries(TOKEN_PROGRAMS).find(
    ([, info]: [string, TokenInfo]) => info.ticker === upperToken
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

  const [programId, tokenInfo] = tokenProgram as [string, TokenInfo];

  // Find token balance
  const tokenBalance = balances?.find(
    (b) => b.mintPubkeyHex === programId
  );

  const handleSubmit = async () => {
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
      const recipientTokenPubkey = AssociatedTokenUtil.getAssociatedTokenAddress(
        mintPubkey,
        recipientPubkey
      );

      // Verify both token accounts exist
      const sourceTokenInfo = await archConnection.readAccountInfo(sourceTokenPubkey);
      if (!sourceTokenInfo?.data) {
        throw new Error("Source token account does not exist. Please create it first.");
      }

      const recipientTokenInfo = await archConnection.readAccountInfo(recipientTokenPubkey);
      if (!recipientTokenInfo?.data) {
        throw new Error("Recipient token account does not exist. Please create it first.");
      }

      // Get decimals from mint
      const mintInfo = await archConnection.readAccountInfo(mintPubkey);
      if (!mintInfo?.data) {
        throw new Error("Invalid token mint account");
      }
      const mintData = MintUtil.deserialize(Buffer.from(mintInfo.data));

      // Create and send transfer transaction
      const signer = useSigner();
      const tx = await transferTx(
        sourceTokenPubkey,
        mintPubkey,
        recipientTokenPubkey,
        senderPubkey,
        BigInt(Math.floor(amountValue * Math.pow(10, mintData.decimals))),
        mintData.decimals,
        signer
      );

      const result = await archConnection.sendTransaction(tx);
      console.log("Transaction sent successfully:", result);

      toast({
        title: "Success",
        description: `Successfully transferred ${amount} ${upperToken} to ${recipient}`,
      });

      // Navigate back to home page after successful transfer
      router.push("/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to transfer tokens";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with back button and title */}
        <div className="flex items-center">
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
          <div className="bg-white rounded-full p-4 w-20 h-20">
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
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-white/10"
            >
              <AtSign className="h-5 w-5" />
            </Button>
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
              >
                Max
              </Button>
            </div>
          </div>

          {/* USD value and available balance display */}
          <div className="flex justify-between text-sm py-2">
            <div className="text-white/60">$0.00</div>
            <div className="text-white/60">
              Available: {tokenBalance 
                ? (Number(tokenBalance.balance) / Math.pow(10, tokenBalance.decimals)).toFixed(tokenBalance.decimals) 
                : "0"} {upperToken}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            variant="outline"
            className="h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            className="h-12 rounded-xl bg-white/10 hover:bg-white/20"
            onClick={handleSubmit}
            disabled={isLoading || !recipient || !amount}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
