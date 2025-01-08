"use client";

import React, { useEffect, useState } from "react";
import { HARDCODED_TOKEN_ID } from "../lib/constants";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { createAssociatedTokenAccountTx, transferTx } from "@repo/apl-token";
import { Pubkey, RuntimeTransaction } from "@saturnbtcio/arch-sdk";

interface TokenBalanceProps {
  walletAddress: string;
}

export function TokenBalance({ walletAddress }: TokenBalanceProps) {
  const [balance, setBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: In the future, implement actual balance fetching using apl-token library
        // For now, we're just mocking the balance since RPC isn't working
        // Example future implementation:
        // const balance = await getTokenBalance(walletAddress, HARDCODED_TOKEN_ID);
        // setBalance(balance);
        
        // Mock balance for now
        setBalance(1000n);
      } catch (err) {
        setError("Failed to fetch token balance");
        console.error("Error fetching token balance:", err);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  const handleCreateTokenAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock signer function for first pass implementation
      const mockSigner = async (tx: RuntimeTransaction) => tx;
      
      // Convert addresses to Uint8Array format for mock implementation
      // Note: In production, we would use proper Pubkey conversion
      const walletPubkey = Buffer.from(walletAddress);
      const tokenPubkey = Buffer.from(HARDCODED_TOKEN_ID);
      
      const tx = await createAssociatedTokenAccountTx(
        walletPubkey,
        tokenPubkey,
        walletPubkey, // payer is same as wallet for demo
        mockSigner
      );
      
      // For now, just log the transaction since RPC isn't working
      console.log("Create ATA transaction:", tx);
    } catch (err) {
      setError("Failed to create token account");
      console.error("Error creating token account:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock signer function for first pass implementation
      const mockSigner = async (tx: RuntimeTransaction) => tx;
      
      // Mock recipient address for demo
      const recipientAddress = Buffer.from("demo-recipient-address");
      const senderAddress = Buffer.from(walletAddress);
      
      const tx = await transferTx(
        senderAddress,
        recipientAddress,
        BigInt(10), // Mock amount of 10 tokens
        senderAddress, // owner
        mockSigner
      );
      
      // For now, just log the transaction since RPC isn't working
      console.log("Transfer transaction:", tx);
    } catch (err) {
      setError("Failed to send tokens");
      console.error("Error sending tokens:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Token Balance</h2>
      <div className="space-y-4">
        {loading ? (
          <p>Loading balance...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            <p className="text-sm text-gray-500">Token ID</p>
            <p className="font-mono mb-2">{HARDCODED_TOKEN_ID}</p>
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-2xl font-bold">{balance.toString()}</p>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Your Token Account Address</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Button 
            onClick={handleCreateTokenAccount}
            disabled={loading}
            className="w-full"
          >
            Create Token Account
          </Button>
          
          <Button 
            onClick={handleSend}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Send 10 Tokens
          </Button>
        </div>
      </div>
    </Card>
  );
}
