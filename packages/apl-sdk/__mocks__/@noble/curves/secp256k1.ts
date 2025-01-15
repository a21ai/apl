export const secp256k1 = {
  getPublicKey: (privateKey: Uint8Array) => new Uint8Array(32),
  sign: (message: Uint8Array, privateKey: Uint8Array) => new Uint8Array(64),
  verify: (signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array) => true,
};
