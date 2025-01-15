const mockCurve = {
  n: BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'),
  p: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f'),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt('0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'),
  Gy: BigInt('0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'),
  h: BigInt(1),
  lowS: true,
};

export const secp256k1 = {
  getPublicKey: (privateKey: Uint8Array) => new Uint8Array(32),
  sign: (message: Uint8Array, privateKey: Uint8Array) => new Uint8Array(64),
  verify: (signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array) => true,
  CURVE: mockCurve,
};

export const p2tr = {
  toOutputScript: (pubkey: Uint8Array) => new Uint8Array(32),
};

export const Address = {
  fromScript: (script: Uint8Array, network: any) => 'mock_address',
};

export const Script = {
  encode: (chunks: any[]) => new Uint8Array(32),
};
