import { SignerCallback } from "../../utils.js";

// Create a mock 64-byte base64 signature
export const MOCK_SIGNATURE = Buffer.alloc(64, 1).toString('base64');

export const mockSigner: SignerCallback = async (message_hash: string) => MOCK_SIGNATURE;
