import { useLaserEyes as useLaserEyesCore } from "@omnisat/lasereyes";
import { xOnly } from "@repo/apl-sdk";
import { useCallback } from "react";

const PUBKEY_LOCAL_STORAGE_KEY = "archway:pubkey";

/**
 * Returns a memoized SignerCallback that uses laserEyes.signMessage
 * @returns SignerCallback function that can be used for signing transactions
 */
export function useLaserEyes() {
  const laserEyes = useLaserEyesCore();
  const publicKey = laserEyes.publicKey
    ? xOnly(laserEyes.publicKey)
    : undefined;

  const disconnect = useCallback(() => {
    laserEyes.disconnect();
    localStorage.removeItem(PUBKEY_LOCAL_STORAGE_KEY);
  }, [laserEyes]);

  return {
    ...laserEyes,
    publicKey: publicKey,
    disconnect,
  };
}
