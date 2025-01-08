"use client";

import React, { useEffect, useState } from "react";
import { HARDCODED_TOKEN_ID } from "../lib/constants";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { createAssociatedTokenAccountTx, transferTx } from "@repo/apl-token";
import { RuntimeTransaction } from "@saturnbtcio/arch-sdk";

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
      
      // Convert string addresses to Uint8Array (Pubkey) format
      const walletPubkey = new Uint8Array(Buffer.from(walletAddress, 'hex'));
      const tokenPubkey = new Uint8Array(Buffer.from(HARDCODED_TOKEN_ID, 'hex'));
      
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
      const recipientAddress = new Uint8Array(Buffer.from("demo-recipient-address", 'hex'));
      const senderAddress = new Uint8Array(Buffer.from(walletAddress, 'hex'));
      
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
    <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6 rounded-3xl">
      <h2 className="text-xl font-semibold mb-4 text-white">Token Balance</h2>
      <div className="space-y-4">
        {loading ? (
          <p className="text-white/60">Loading balance...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div>
            <p className="text-white/60 text-xs">Token ID</p>
            <p className="text-white text-sm font-mono mb-2">{HARDCODED_TOKEN_ID}</p>
            <p className="text-white/60 text-xs">Balance</p>
            <p className="text-white text-2xl font-bold">{balance.toString()}</p>
            
            <div className="mt-4">
              <p className="text-white/60 text-xs mb-2">Your Token Account Address</p>
              <p className="text-white text-sm font-mono break-all">{walletAddress}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Button 
            onClick={handleCreateTokenAccount}
            disabled={loading}
            variant="ghost"
            className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20 rounded-full py-6"
          >
            Create Token Account
          </Button>
          
          <Button 
            onClick={handleSend}
            variant="ghost"
            disabled={loading}
            className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ease-in-out border border-white/20 rounded-full py-6"
          >
            Send 10 Tokens
          </Button>
        </div>
      </div>
    </Card>
  );
}
