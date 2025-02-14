use arch_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};

use crate::instruction::SerializableOutPoint;

#[derive(BorshSerialize, BorshDeserialize, Debug, Default)]
pub struct UtxoVault {
    /// The authority that can manage the vault
    pub authority: Pubkey,
    /// The mint for the wrapped token
    pub mint: Pubkey,
    /// Total amount of sats locked in the vault
    pub total_amount: u64,
    /// Number of active UTXOs
    pub utxo_count: u32,
    pub is_initialized: bool,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct BitcoinUtxo {
    /// The Bitcoin transaction outpoint
    pub outpoint: SerializableOutPoint,
    /// Amount of satoshis in this UTXO
    pub amount: u64,
    /// The Bitcoin script pubkey
    pub script_pubkey: Vec<u8>,
    /// Whether this UTXO has been spent
    pub is_spent: bool,
}

impl UtxoVault {
    pub const LEN: usize = 32 + 1 + 32 + 8 + 4;

    pub fn new(authority: Pubkey, mint: Pubkey) -> Self {
        Self {
            authority,
            is_initialized: true,
            mint,
            total_amount: 0,
            utxo_count: 0,
        }
    }
}

impl Sealed for UtxoVault {}

impl IsInitialized for UtxoVault {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for UtxoVault {
    const LEN: usize = Self::LEN;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let data = borsh::to_vec(self).unwrap();
        dst[..data.len()].copy_from_slice(&data);
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        borsh::from_slice(src).map_err(|_| ProgramError::InvalidAccountData)
    }
}
