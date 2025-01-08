"use client";

import React, { useEffect, useState } from "react";

interface TokenBalanceDisplayProps {
  walletAddress: string;
}

export function TokenBalanceDisplay({ walletAddress }: TokenBalanceDisplayProps) {
  const [balance, setBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual balance fetching
        // Mock balance for now
        setBalance(1000n);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  return (
    <p className="text-white/60 text-sm">
      {loading ? "Loading..." : `${balance.toString()} APL`}
    </p>
  );
}
