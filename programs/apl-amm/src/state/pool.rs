//! Pool state definitions

use {
    arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs},
    arch_program::{
        program_error::ProgramError,
        program_pack::{IsInitialized, Pack, Sealed},
        pubkey::{Pubkey, PUBKEY_BYTES},
    },
};

/// Pool data.
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Pool {
    /// First token mint
    pub token_a: Pubkey,
    /// Second token mint
    pub token_b: Pubkey,
    /// LP token mint
    pub lp_mint: Pubkey,
    /// Vault for token A
    pub token_a_vault: Pubkey,
    /// Vault for token B
    pub token_b_vault: Pubkey,
    /// Fee numerator
    pub fee_numerator: u16,
    /// Fee denominator
    pub fee_denominator: u16,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}

impl Sealed for Pool {}
impl IsInitialized for Pool {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for Pool {
    const LEN: usize = 32 * 5 + 2 * 2 + 1;

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, 165];
        let (token_a, token_b, lp_mint, token_a_vault, token_b_vault, fee_numerator, fee_denominator, is_initialized) =
            array_refs![src, 32, 32, 32, 32, 32, 2, 2, 1];

        Ok(Pool {
            token_a: Pubkey::new_from_array(*token_a),
            token_b: Pubkey::new_from_array(*token_b),
            lp_mint: Pubkey::new_from_array(*lp_mint),
            token_a_vault: Pubkey::new_from_array(*token_a_vault),
            token_b_vault: Pubkey::new_from_array(*token_b_vault),
            fee_numerator: u16::from_le_bytes(*fee_numerator),
            fee_denominator: u16::from_le_bytes(*fee_denominator),
            is_initialized: match is_initialized {
                [0] => false,
                [1] => true,
                _ => return Err(ProgramError::InvalidAccountData),
            },
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, 165];
        let (
            token_a_dst,
            token_b_dst,
            lp_mint_dst,
            token_a_vault_dst,
            token_b_vault_dst,
            fee_numerator_dst,
            fee_denominator_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst, 32, 32, 32, 32, 32, 2, 2, 1];

        token_a_dst.copy_from_slice(self.token_a.as_ref());
        token_b_dst.copy_from_slice(self.token_b.as_ref());
        lp_mint_dst.copy_from_slice(self.lp_mint.as_ref());
        token_a_vault_dst.copy_from_slice(self.token_a_vault.as_ref());
        token_b_vault_dst.copy_from_slice(self.token_b_vault.as_ref());
        *fee_numerator_dst = self.fee_numerator.to_le_bytes();
        *fee_denominator_dst = self.fee_denominator.to_le_bytes();
        is_initialized_dst[0] = self.is_initialized as u8;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_unpack() {
        let pool = Pool {
            token_a: Pubkey::new_unique(),
            token_b: Pubkey::new_unique(),
            lp_mint: Pubkey::new_unique(),
            token_a_vault: Pubkey::new_unique(),
            token_b_vault: Pubkey::new_unique(),
            fee_numerator: 25,
            fee_denominator: 10000,
            is_initialized: true,
        };

        let mut packed = vec![0u8; Pool::LEN];
        Pool::pack(pool, &mut packed).unwrap();
        let unpacked = Pool::unpack(&packed).unwrap();
        assert_eq!(pool, unpacked);
    }
}
