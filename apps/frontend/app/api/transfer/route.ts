import { NextResponse } from "next/server";
import { archConnection } from "../../../lib/arch";
import { TOKEN_PROGRAMS } from "../../../lib/constants";

import {
  AssociatedTokenUtil,
  MintUtil,
  transferTx,
  createSignerFromKeypair,
} from "@repo/apl-sdk";

// Response types
type SuccessResponse = {
  message: string;
  txId: string;
};

type ErrorResponse = {
  error: string;
};

// Server-side keypair for signing transactions
const getServerKeypair = () => {
  const privateKeyHex = process.env.SERVER_PRIVATE_KEY;
  if (!privateKeyHex) {
    throw new Error("SERVER_PRIVATE_KEY environment variable is not set");
  }
  return {
    publicKey: Buffer.from(privateKeyHex.slice(64), 'hex'),
    secretKey: Buffer.from(privateKeyHex, 'hex'),
  };
};

export async function POST(request: Request) {
  try {
    const { publicKey, programId, recipient, amount } = await request.json();

    // Validate inputs
    if (!publicKey || !programId || !recipient || !amount) {
      return NextResponse.json<ErrorResponse>(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validate program ID exists in our constants
    if (!(programId in TOKEN_PROGRAMS)) {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid token program ID" },
        { status: 400 }
      );
    }

    // Convert hex public keys to Pubkey
    const senderPubkey = Buffer.from(publicKey, "hex");
    const recipientPubkey = Buffer.from(recipient, "hex");
    const mintPubkey = Buffer.from(programId, "hex");

    console.log(`Creating transfer transaction...`);
    console.log(`From: ${publicKey}`);
    console.log(`To: ${recipient}`);
    console.log(`Amount: ${amount}`);

    // Get associated token accounts for sender and recipient
    const sourceTokenPubkey = AssociatedTokenUtil.getAssociatedTokenAddress(
      mintPubkey,
      senderPubkey
    );

    const recipientTokenPubkey = AssociatedTokenUtil.getAssociatedTokenAddress(
      mintPubkey,
      recipientPubkey
    );

    // Verify both token accounts exist
    console.log("Verifying token accounts...");
    const sourceTokenInfo = await archConnection.readAccountInfo(sourceTokenPubkey);
    if (!sourceTokenInfo?.data) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: `Source token account ${Buffer.from(sourceTokenPubkey).toString("hex")} does not exist. Please create it first.`
        },
        { status: 400 }
      );
    }

    const recipientTokenInfo = await archConnection.readAccountInfo(
      recipientTokenPubkey
    );
    if (!recipientTokenInfo?.data) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: `Recipient token account ${Buffer.from(recipientTokenPubkey).toString("hex")} does not exist. Please create it first.`
        },
        { status: 400 }
      );
    }
    console.log("Token accounts verified successfully.");

    // Fetch mint data to get decimals
    const mintInfo = await archConnection.readAccountInfo(mintPubkey);
    if (!mintInfo?.data) {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid token mint account" },
        { status: 400 }
      );
    }

    const mintData = MintUtil.deserialize(Buffer.from(mintInfo.data));
    const decimals = mintData.decimals;

    console.log("Creating transfer transaction...");
    console.log(`Source Wallet: ${publicKey}`);
    console.log(`Recipient Wallet: ${recipient}`);
    console.log(`Amount: ${amount}`);
    console.log(`Decimals: ${decimals} (from mint)`);

    const signer = createSignerFromKeypair(getServerKeypair());
    const tx = await transferTx(
      sourceTokenPubkey,
      mintPubkey,
      recipientTokenPubkey,
      senderPubkey,
      BigInt(Math.floor(amount * Math.pow(10, decimals))),
      decimals,
      signer
    );

    console.log("Sending transaction...");
    const result = await archConnection.sendTransaction(tx);
    console.log(`Transaction sent successfully: ${result}`);

    return NextResponse.json<SuccessResponse>({
      message: "Transfer completed successfully",
      txId: result,
    });
  } catch (error) {
    console.error("Error transferring tokens:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to transfer tokens" },
      { status: 500 }
    );
  }
}
