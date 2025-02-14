use crate::{
    error::SatsError,
    instruction::{SatsInstruction, SerializableOutPoint},
    state::{BitcoinUtxo, UtxoVault},
};
use arch_program::{
    account::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};

/// Program processor
pub struct Processor;

impl Processor {
    /// Process instruction
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction: SatsInstruction,
    ) -> Result<(), ProgramError> {
        match instruction {
            SatsInstruction::InitializeVault => {
                Self::process_initialize_vault(accounts, program_id)
            }
            SatsInstruction::DepositUtxo {
                outpoint,
                amount,
                script_pubkey,
            } => Self::process_deposit_utxo(accounts, program_id, outpoint, amount, script_pubkey),
            SatsInstruction::WithdrawUtxo {
                amount,
                bitcoin_address,
            } => Self::process_withdraw_utxo(accounts, program_id, amount, bitcoin_address),
        }
    }

    fn process_initialize_vault(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> Result<(), ProgramError> {
        let account_info_iter = &mut accounts.iter();
        let authority = next_account_info(account_info_iter)?;
        let vault_account = next_account_info(account_info_iter)?;
        let mint_account = next_account_info(account_info_iter)?;

        if !authority.is_signer {
            return Err(SatsError::InvalidMintAuthority.into());
        }

        let vault = UtxoVault::new(*authority.key, *mint_account.key);
        vault.pack_into_slice(&mut vault_account.data.borrow_mut());

        Ok(())
    }

    fn process_deposit_utxo(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        outpoint: SerializableOutPoint,
        amount: u64,
        script_pubkey: Vec<u8>,
    ) -> Result<(), ProgramError> {
        let account_info_iter = &mut accounts.iter();
        let authority = next_account_info(account_info_iter)?;
        let vault_account = next_account_info(account_info_iter)?;
        let utxo_account = next_account_info(account_info_iter)?;
        let mint_account = next_account_info(account_info_iter)?;
        let recipient_token_account = next_account_info(account_info_iter)?;

        if !authority.is_signer {
            return Err(SatsError::InvalidMintAuthority.into());
        }

        let mut vault = UtxoVault::unpack(&vault_account.data.borrow())?;
        if vault.authority != *authority.key {
            return Err(SatsError::InvalidMintAuthority.into());
        }

        // Store UTXO information
        let utxo = BitcoinUtxo {
            outpoint,
            amount,
            script_pubkey,
            is_spent: false,
        };
        borsh::to_writer(&mut *utxo_account.data.borrow_mut(), &utxo)
            .map_err(|_| ProgramError::InvalidAccountData)?;

        // Update vault state
        vault.total_amount = vault
            .total_amount
            .checked_add(amount)
            .ok_or(SatsError::InvalidUtxo)?;
        vault.utxo_count = vault
            .utxo_count
            .checked_add(1)
            .ok_or(SatsError::InvalidUtxo)?;
        vault.pack_into_slice(&mut vault_account.data.borrow_mut());

        // TODO: Mint equivalent tokens to recipient
        // This would involve calling the token program to mint tokens

        Ok(())
    }

    fn process_withdraw_utxo(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        amount: u64,
        bitcoin_address: String,
    ) -> Result<(), ProgramError> {
        let account_info_iter = &mut accounts.iter();
        let token_owner = next_account_info(account_info_iter)?;
        let vault_account = next_account_info(account_info_iter)?;
        let source_token_account = next_account_info(account_info_iter)?;
        let mint_account = next_account_info(account_info_iter)?;

        if !token_owner.is_signer {
            return Err(SatsError::InvalidBurnAuthority.into());
        }

        let mut vault = UtxoVault::unpack(&vault_account.data.borrow())?;
        if vault.total_amount < amount {
            return Err(SatsError::InsufficientBalance.into());
        }

        // TODO: Burn tokens from source account
        // This would involve calling the token program to burn tokens

        // Update vault state
        vault.total_amount = vault
            .total_amount
            .checked_sub(amount)
            .ok_or(SatsError::InsufficientBalance)?;
        vault.pack_into_slice(&mut vault_account.data.borrow_mut());

        // TODO: Implement Bitcoin withdrawal logic
        // This would involve creating and broadcasting a Bitcoin transaction

        Ok(())
    }
}
