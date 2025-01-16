import { useLaserEyes as useLaserEyesCore } from "@omnisat/lasereyes";
import { xOnly } from "@repo/apl-sdk";
/**
 * Returns a memoized SignerCallback that uses laserEyes.signMessage
 * @returns SignerCallback function that can be used for signing transactions
 */
export function useLaserEyes() {
  const laserEyes = useLaserEyesCore();

  const pk = laserEyes.publicKey ? xOnly(laserEyes.publicKey) : undefined;

  return {
    ...laserEyes,
    publicKey: pk,
  };
}
