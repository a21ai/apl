export async function mintToTx(
mint: Pubkey,
destination: Pubkey,
amount: bigint,
mintAuthority: Pubkey,
signer: SignerCallback
): Promise<RuntimeTransaction> {
const data = serializeInstruction(TokenInstruction.MintTo, { amount });

const keys = [
{ pubkey: mint, is_signer: false, is_writable: true },
{ pubkey: destination, is_signer: false, is_writable: true },
{ pubkey: mintAuthority, is_signer: true, is_writable: false },
];

const tokenInstruction: Instruction = {
program_id: TOKEN_PROGRAM_ID,
accounts: keys,
data: data,
};

return createAndSignTransaction([], tokenInstruction, signer);
}

export async function initializeAccountTx(
account: Pubkey,
mint: Pubkey,
owner: Pubkey,
payer: Pubkey,
signer: SignerCallback
): Promise<RuntimeTransaction> {
const data = serializeInstruction(TokenInstruction.InitializeAccount, {});

const keys = [
{ pubkey: account, is_signer: false, is_writable: true },
{ pubkey: mint, is_signer: false, is_writable: false },
{ pubkey: owner, is_signer: false, is_writable: false },
{ pubkey: payer, is_signer: true, is_writable: true },
];

const tokenInstruction: Instruction = {
program_id: TOKEN_PROGRAM_ID,
accounts: keys,
data: data,
};

return createAndSignTransaction([], tokenInstruction, signer);
}
