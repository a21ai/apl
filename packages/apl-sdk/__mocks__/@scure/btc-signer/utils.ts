import { secp256k1 } from './index';

export const randomPrivateKeyBytes = () => new Uint8Array(32);
export const pubSchnorr = (privateKey: Uint8Array) => secp256k1.getPublicKey(privateKey);
export const schnorrSign = (message: Uint8Array, privateKey: Uint8Array) => secp256k1.sign(message, privateKey);
export const schnorrVerify = (signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array) => secp256k1.verify(signature, message, publicKey);
