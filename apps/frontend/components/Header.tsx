"use client";

import * as React from "react";
import { Power } from "lucide-react";
import { useLaserEyes } from "@omnisat/lasereyes";
import { truncateAddress } from "../lib/utils";

export function Header(): React.ReactElement {
  const { publicKey, disconnect } = useLaserEyes();
  const isConnected = !!publicKey;

  return (
    <header
      className="flex items-center justify-between px-4 border-b border-white/10"
      style={{ height: "60px" }}
    >
      <div>
        {isConnected ? (
          <>
            <p className="text-white/60 text-xs">Connected Address</p>
            <p className="text-sm font-mono text-white">
              {truncateAddress(publicKey!)}
            </p>
          </>
        ) : (
          <p className="text-white/60 text-xs">Not Connected</p>
        )}
      </div>
      {isConnected && (
        <Power
          className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors"
          onClick={() => disconnect()}
        />
      )}
    </header>
  );
}
