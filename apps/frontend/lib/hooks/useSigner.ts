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

      if (laserEyes.provider === "unisat") {
        // @ts-ignore
        const signature = await window.unisat.signMessage(
          messageHash,
          "bip322-simple"
        );
        return signature;
      }

      // LaserEyes expects hex string for signMessage
      const signature = await laserEyes.signMessage(messageHash);

      debugger;

      return signature;
    };
  }, [laserEyes]);

  return signerCallback;
}
