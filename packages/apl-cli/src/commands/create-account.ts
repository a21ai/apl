import { Command } from 'commander';
import { loadKeypairWithPubkey, createSignerFromKeypair, createRpcConnection, handleError } from '../utils.js';
import { PubkeyUtil } from '@repo/arch-sdk';
import { deriveAssociatedTokenAddress, createAssociatedTokenAccountTx } from '@repo/apl-token';

export default function createAccountCommand(program: Command) {
  program
    .command('create-account <tokenAddress>')
    .description('Create an associated token account')
    .action(async (tokenAddress: string) => {
      try {
        const { keypairData, pubkey } = loadKeypairWithPubkey();
        const mintPubkey = PubkeyUtil.fromHex(tokenAddress);
        const rpcConnection = createRpcConnection();

        // Verify token exists
        const tokenInfo = await rpcConnection.readAccountInfo(mintPubkey);
        if (!tokenInfo || !tokenInfo.data) {
          throw new Error('Invalid token mint account');
        }

        console.log(`Creating account for token: ${tokenAddress}`);
        console.log(`Owner: ${keypairData.publicKey}`);

        // Create associated token account
        const signer = createSignerFromKeypair(keypairData);
        const [associatedAddress] = await deriveAssociatedTokenAddress(
          pubkey,
          mintPubkey
        );

        const tx = await createAssociatedTokenAccountTx(
          pubkey,
          mintPubkey,
          pubkey,
          signer
        );

        console.log(`Associated token account: ${Buffer.from(associatedAddress).toString('hex')}`);
      } catch (error) {
        handleError(error);
      }
    });
}
