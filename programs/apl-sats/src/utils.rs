use arch_program::{program_error::ProgramError, pubkey::Pubkey};
use bitcoin::{Address, Network, Transaction};
use std::str::FromStr;

use crate::error::SatsError;

/// Validates a Bitcoin address
pub fn validate_bitcoin_address(
    address: &str,
    network: Network,
) -> Result<Address<bitcoin::address::NetworkChecked>, ProgramError> {
    parse_bitcoin_address(address)?
        .require_network(network)
        .map_err(|_| SatsError::InvalidBitcoinAddress.into())
}

/// Validates a Bitcoin transaction
pub fn validate_bitcoin_transaction(tx: &Transaction) -> Result<(), ProgramError> {
    // TODO: Implement transaction validation logic
    // This would include:
    // 1. Checking transaction format
    // 2. Verifying signatures
    // 3. Validating input/output amounts
    Ok(())
}

/// Derives the vault authority PDA
pub fn find_vault_authority(program_id: &Pubkey, mint: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"vault", mint.as_ref()], program_id)
}

/// Derives the UTXO account PDA
pub fn get_utxo_pda(program_id: &Pubkey, txid: &[u8; 32], vout: u32) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"utxo", txid, &vout.to_le_bytes()], program_id)
}

pub fn parse_bitcoin_address(
    address: &str,
) -> Result<Address<bitcoin::address::NetworkUnchecked>, ProgramError> {
    Address::from_str(address).map_err(|_| SatsError::InvalidBitcoinAddress.into())
}

pub fn validate_bitcoin_transaction(_tx: &Transaction) -> Result<(), ProgramError> {
    // TODO: Implement Bitcoin transaction validation
    Ok(())
}
