"use server";

import { archConnection } from "@/lib/arch";
import {
  createSignerFromKeypair,
  //   sendCoins,
  AssociatedTokenUtil,
  associatedTokenTx,
  mintToTx,
  MintUtil,
  waitForConfirmation,
  loadWallet,
  unloadWallet,
  sendToAddress,
} from "@repo/apl-sdk";
import { TOKEN_PROGRAMS } from "@/lib/constants";

const RPC_CONFIG = {
  url: process.env.RPC_URL || "http://localhost:9002",
  username: process.env.RPC_USERNAME || "bitcoin",
  password: process.env.RPC_PASSWORD || "bitcoin",
};
const WALLET_NAME = "testwallet";

/**
 * Initialize a new wallet by creating a keypair and funding it with initial coins
 * @returns The public key and address of the initialized wallet
 */
export async function initializeWallet(publicKey: string) {
  try {
    console.log("Initializing wallet: ", publicKey);

    // Create a new keypair for the wallet
    console.log("Created wallet keypair:", {
      publicKey: Buffer.from(publicKey).toString("hex"),
    });

    // Create a signer from the keypair
    const signer = async (a: string) => a;
    console.log("Created signer for wallet");

    // Track if we created a new associated token account
    let createdNewAccount = false;

    // Create associated token accounts for each token in constants
    const tokenMints = Object.keys(TOKEN_PROGRAMS);
    console.log(
      `Creating associated token accounts for ${tokenMints.length} tokens:`,
      tokenMints
    );

    let isWalletLoaded = false;

    for (const mint of tokenMints) {
      console.log(`\nProcessing token mint: ${mint}`);
      console.log(
        `Token details:`,
        TOKEN_PROGRAMS[mint as keyof typeof TOKEN_PROGRAMS]
      );

      // Get the associated token address for this mint
      const associatedTokenAddress =
        AssociatedTokenUtil.getAssociatedTokenAddress(
          Buffer.from(mint, "hex"),
          Buffer.from(publicKey, "hex")
        );
      console.log(
        "Generated associated token address:",
        Buffer.from(associatedTokenAddress).toString("hex")
      );

      try {
        // Check if associated token account already exists
        const associatedTokenInfo = await archConnection.readAccountInfo(
          associatedTokenAddress
        );
        console.log(
          "Associated token account already exists:",
          associatedTokenInfo
        );
      } catch {
        createdNewAccount = true;
        console.log("Associated token account does not exist. Creating...");

        // Get the contract address for the associated token account
        const associatedTokenContractAddress =
          await archConnection.getAccountAddress(associatedTokenAddress);
        console.log(
          "Contract address for associated token:",
          associatedTokenContractAddress
        );

        // Fund the associated token account with coins

        if (!isWalletLoaded) {
          await loadWallet(RPC_CONFIG, WALLET_NAME);
          isWalletLoaded = true;
        }

        console.log("Sending initial coins to associated token account...");
        const txid = await sendToAddress(
          RPC_CONFIG,
          associatedTokenContractAddress,
          3000,
          WALLET_NAME
        );

        const utxo = { txid, vout: 0 };
        console.log("Funded associated token account. UTXO:", utxo);

        // Create the associated token account transaction
        console.log("Creating associated token account transaction...");
        const tx = await associatedTokenTx(
          utxo,
          associatedTokenAddress,
          Buffer.from(publicKey, "hex"),
          Buffer.from(mint, "hex"),
          signer
        );
        console.log("Created transaction");

        // Send the transaction
        console.log("Sending transaction...");
        const txResult = await archConnection.sendTransaction(tx);
        await waitForConfirmation(archConnection, txResult);
        console.log("Transaction sent successfully:", txResult);
      }
    }

    if (isWalletLoaded) {
      await unloadWallet(RPC_CONFIG, WALLET_NAME);
    }

    console.log(
      "Successfully initialized wallet and all associated token accounts"
    );

    // Only mint tokens if we created a new account during this execution
    if (!createdNewAccount) {
      console.log("No new accounts created, skipping token dispensing");
      return;
    }

    // Now mint 1000 tokens to the new account
    const dispenserToken = Object.keys(TOKEN_PROGRAMS).find(
      (token) =>
        TOKEN_PROGRAMS[token as keyof typeof TOKEN_PROGRAMS]?.ticker === "BTC"
    );

    if (!dispenserToken) {
      throw new Error("BTC token not found in TOKEN_PROGRAMS");
    }

    // Create dispenser keypair from env vars
    if (
      !process.env.DISPENSER_PRIVATE_KEY ||
      !process.env.DISPENSER_PUBLIC_KEY
    ) {
      throw new Error("Dispenser keypair env vars not set");
    }

    const dispenserKeypair = {
      publicKey: Buffer.from(process.env.DISPENSER_PUBLIC_KEY, "hex"),
      secretKey: Buffer.from(process.env.DISPENSER_PRIVATE_KEY, "hex"),
    };

    // Verify mint account and authority
    console.log("Verifying dispenser token mint account...");
    const mintInfo = await archConnection.readAccountInfo(
      Buffer.from(dispenserToken, "hex")
    );
    if (!mintInfo || !mintInfo.data) {
      throw new Error("Invalid or uninitialized dispenser token mint account");
    }

    const mintData = MintUtil.deserialize(Buffer.from(mintInfo.data));
    if (mintData.mint_authority === null) {
      throw new Error("Dispenser token mint has no mint authority");
    }

    if (
      !Buffer.from(mintData.mint_authority).equals(dispenserKeypair.publicKey)
    ) {
      throw new Error("Dispenser keypair is not the mint authority");
    }

    // Get the already computed associated token account for the dispenser token
    const recipientTokenAccount = AssociatedTokenUtil.getAssociatedTokenAddress(
      Buffer.from(dispenserToken, "hex"),
      Buffer.from(publicKey, "hex")
    );

    console.log(
      `Creating mint transaction for 1000 ${TOKEN_PROGRAMS[dispenserToken as keyof typeof TOKEN_PROGRAMS]?.ticker || "tokens"}...`
    );
    const dispenserSigner = createSignerFromKeypair(dispenserKeypair);
    const mintTx = await mintToTx(
      Buffer.from(dispenserToken, "hex"),
      recipientTokenAccount,
      BigInt(1e9),
      dispenserKeypair.publicKey,
      dispenserSigner
    );

    console.log("Sending mint transaction...");
    const mintResult = await archConnection.sendTransaction(mintTx);
    await waitForConfirmation(archConnection, mintResult);
    console.log("Successfully minted 1000 tokens to new account:", mintResult);

    return;
  } catch (error) {
    console.error("Failed to initialize wallet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Mints SCAT tokens to a specified recipient address
 * @param recipientPublicKey The recipient's public key in hex format
 * @param amount The amount of SCAT tokens to mint (in base units)
 * @returns The transaction result or error
 */
export async function mintScat(
  recipientPublicKey: string,
  amount: bigint = BigInt(1e9)
) {
  try {
    const scatTokenMint = Object.keys(TOKEN_PROGRAMS).find(
      (token) =>
        TOKEN_PROGRAMS[token as keyof typeof TOKEN_PROGRAMS]?.ticker === "SCAT"
    );

    if (!scatTokenMint) {
      throw new Error("SCAT token not found in TOKEN_PROGRAMS");
    }

    // Create dispenser keypair from env vars
    if (
      !process.env.DISPENSER_PRIVATE_KEY ||
      !process.env.DISPENSER_PUBLIC_KEY
    ) {
      throw new Error("Dispenser keypair env vars not set");
    }

    const dispenserKeypair = {
      publicKey: Buffer.from(process.env.DISPENSER_PUBLIC_KEY, "hex"),
      secretKey: Buffer.from(process.env.DISPENSER_PRIVATE_KEY, "hex"),
    };

    // Verify mint account and authority
    console.log("Verifying SCAT token mint account...");
    const mintInfo = await archConnection.readAccountInfo(
      Buffer.from(scatTokenMint, "hex")
    );
    if (!mintInfo || !mintInfo.data) {
      throw new Error("Invalid or uninitialized SCAT token mint account");
    }

    const mintData = MintUtil.deserialize(Buffer.from(mintInfo.data));
    if (mintData.mint_authority === null) {
      throw new Error("SCAT token mint has no mint authority");
    }

    if (
      !Buffer.from(mintData.mint_authority).equals(dispenserKeypair.publicKey)
    ) {
      throw new Error("Dispenser keypair is not the mint authority");
    }

    // Get the associated token account for the recipient
    const recipientTokenAccount = AssociatedTokenUtil.getAssociatedTokenAddress(
      Buffer.from(scatTokenMint, "hex"),
      Buffer.from(recipientPublicKey, "hex")
    );

    console.log(`Creating mint transaction for ${amount} SCAT tokens...`);
    const dispenserSigner = createSignerFromKeypair(dispenserKeypair);
    const mintTx = await mintToTx(
      Buffer.from(scatTokenMint, "hex"),
      recipientTokenAccount,
      amount,
      dispenserKeypair.publicKey,
      dispenserSigner
    );

    console.log("Sending mint transaction...");
    const mintResult = await archConnection.sendTransaction(mintTx);

    return {
      success: true,
      txId: mintResult,
    };
  } catch (error) {
    console.error("Failed to mint SCAT tokens:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
