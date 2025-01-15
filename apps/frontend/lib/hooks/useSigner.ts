import { useMemo } from "react";
import { useLaserEyes } from "@omnisat/lasereyes";
import { SignerCallback } from "@repo/apl-sdk";

/**
 * Returns a memoized SignerCallback that uses laserEyes.signMessage
 * @returns SignerCallback function that can be used for signing transactions
 */
export function useSigner(): SignerCallback {
  const laserEyes = useLaserEyes();

  const signerCallback = useMemo<SignerCallback>(() => {
    return async (messageHash: string) => {
      if (!laserEyes.publicKey) {
        throw new Error("Wallet not connected");
      }

      // LaserEyes expects hex string for signMessage
      const signature = await laserEyes.signMessage(messageHash);
      return signature;
    };
  }, [laserEyes]);

  return signerCallback;
}
