import { NextResponse } from "next/server";
import { archConnection } from "@/lib/arch";
import { TOKEN_PROGRAMS } from "@/lib/constants";
import {
  AssociatedTokenUtil,
  associatedTokenTx,
  sendCoins,
  createSignerFromKeypair,
} from "@repo/apl-sdk";
import { rpcConfig } from "@/lib/config";

// Response types
type SuccessResponse = {
  message: string;
  address: string;
  txId?: string;
  token: {
    name: string;
    ticker: string;
    icon: string;
  };
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
    const { publicKey, programId } = await request.json();

    // Validate inputs
    if (!publicKey || !programId) {
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

    // Type assertion since we've validated the program ID
    const tokenProgram = TOKEN_PROGRAMS[programId as keyof typeof TOKEN_PROGRAMS];

    // Convert hex public key to Pubkey
    const ownerPubkey = Buffer.from(publicKey, 'hex');
    const mintPubkey = Buffer.from(programId, 'hex');

    console.log(`Creating account for token: ${programId}`);
    console.log(`Owner: ${publicKey}`);

    // Verify token exists
    const tokenInfo = await archConnection.readAccountInfo(mintPubkey);
    if (!tokenInfo || !tokenInfo.data) {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid token mint account" },
        { status: 400 }
      );
    }

    // Get associated token account address
    const associatedTokenPubkey = AssociatedTokenUtil.getAssociatedTokenAddress(
      mintPubkey,
      ownerPubkey,
      true
    );

    console.log(
      `AssociatedTokenAccount: ${Buffer.from(associatedTokenPubkey).toString("hex")}`
    );

    try {
      // Check if account already exists
      const associatedTokenInfo = await archConnection.readAccountInfo(
        associatedTokenPubkey
      );

      if (associatedTokenInfo?.data) {
        return NextResponse.json<SuccessResponse>({
          message: "Token account already exists",
          address: Buffer.from(associatedTokenPubkey).toString("hex"),
          token: tokenProgram,
        });
      }
    } catch {
      console.log(`Associated token account does not exist. Creating...`);
    }

    // Get address for UTXO
    const associatedTokenAddress = await archConnection.getAccountAddress(
      associatedTokenPubkey
    );

    console.log(`Sending coins to address: ${associatedTokenAddress}`);

    // Send coins for UTXO
    const utxo = await sendCoins(rpcConfig, associatedTokenAddress, 3000);
    console.log(`UTXO created: ${utxo.txid}`);

    // Create the token account
    const tx = await associatedTokenTx(
      utxo,
      associatedTokenPubkey,
      ownerPubkey,
      mintPubkey,
      createSignerFromKeypair(getServerKeypair())
    );

    console.log(`Transaction created, sending...`);
    const result = await archConnection.sendTransaction(tx);
    console.log(`Transaction sent successfully: ${result}`);

    return NextResponse.json<SuccessResponse>({
      message: "Token account created successfully",
      address: Buffer.from(associatedTokenPubkey).toString("hex"),
      txId: result,
      token: tokenProgram,
    });
  } catch (error) {
    console.error("Error creating token account:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to create token account" },
      { status: 500 }
    );
  }
}
