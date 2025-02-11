//! Instruction types

use {
    crate::error::AmmError,
    arch_program::{
        msg,
        program_error::ProgramError,
        pubkey::Pubkey,
    },
    std::{convert::TryInto, mem::size_of},
};

/// Instructions supported by the AMM program.
#[repr(C)]
#[derive(Clone, Debug, PartialEq)]
pub enum AmmInstruction {
    /// Initializes a new pool with two tokens.
    ///
    /// Accounts expected by this instruction:
    ///
    ///   0. `[writable]` The pool account to initialize
    ///   1. `[]` Token A mint
    ///   2. `[]` Token B mint
    ///   3. `[writable]` LP token mint (must be created beforehand)
    ///   4. `[writable]` Token A vault
    ///   5. `[writable]` Token B vault
    ///   6. `[signer]` Pool authority
    InitializePool {
        /// Fee numerator, fee = numerator/denominator
        fee_numerator: u16,
        /// Fee denominator
        fee_denominator: u16,
    },

    /// Adds liquidity to the pool.
    ///
    /// Accounts expected by this instruction:
    ///
    ///   0. `[writable]` The pool account
    ///   1. `[writable]` Token A vault
    ///   2. `[writable]` Token B vault
    ///   3. `[writable]` LP token mint
    ///   4. `[writable]` User's token A account
    ///   5. `[writable]` User's token B account
    ///   6. `[writable]` User's LP token account
    ///   7. `[signer]` User authority
    AddLiquidity {
        /// Amount of token A to add
        token_a_amount: u64,
        /// Amount of token B to add
        token_b_amount: u64,
        /// Minimum LP tokens to mint, prevents excessive slippage
        min_lp_amount: u64,
    },

    /// Removes liquidity from the pool.
    ///
    /// Accounts expected by this instruction:
    ///
    ///   0. `[writable]` The pool account
    ///   1. `[writable]` Token A vault
    ///   2. `[writable]` Token B vault
    ///   3. `[writable]` LP token mint
    ///   4. `[writable]` User's token A account
    ///   5. `[writable]` User's token B account
    ///   6. `[writable]` User's LP token account
    ///   7. `[signer]` User authority
    RemoveLiquidity {
        /// Amount of LP tokens to burn
        lp_amount: u64,
        /// Minimum token A to receive
        min_token_a_amount: u64,
        /// Minimum token B to receive
        min_token_b_amount: u64,
    },

    /// Swaps tokens in the pool.
    ///
    /// Accounts expected by this instruction:
    ///
    ///   0. `[writable]` The pool account
    ///   1. `[writable]` Token input vault
    ///   2. `[writable]` Token output vault
    ///   3. `[writable]` User's token input account
    ///   4. `[writable]` User's token output account
    ///   5. `[signer]` User authority
    Swap {
        /// Amount of input tokens to swap
        amount_in: u64,
        /// Minimum output tokens to receive
        min_amount_out: u64,
    },
}

impl AmmInstruction {
    /// Unpacks a byte buffer into an [AmmInstruction](enum.AmmInstruction.html).
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&tag, rest) = input.split_first().ok_or(AmmError::InvalidInstruction)?;

        Ok(match tag {
            0 => {
                let (fee_numerator, rest) = Self::unpack_u16(rest)?;
                let (fee_denominator, _) = Self::unpack_u16(rest)?;
                Self::InitializePool {
                    fee_numerator,
                    fee_denominator,
                }
            }
            1 => {
                let (token_a_amount, rest) = Self::unpack_u64(rest)?;
                let (token_b_amount, rest) = Self::unpack_u64(rest)?;
                let (min_lp_amount, _) = Self::unpack_u64(rest)?;
                Self::AddLiquidity {
                    token_a_amount,
                    token_b_amount,
                    min_lp_amount,
                }
            }
            2 => {
                let (lp_amount, rest) = Self::unpack_u64(rest)?;
                let (min_token_a_amount, rest) = Self::unpack_u64(rest)?;
                let (min_token_b_amount, _) = Self::unpack_u64(rest)?;
                Self::RemoveLiquidity {
                    lp_amount,
                    min_token_a_amount,
                    min_token_b_amount,
                }
            }
            3 => {
                let (amount_in, rest) = Self::unpack_u64(rest)?;
                let (min_amount_out, _) = Self::unpack_u64(rest)?;
                Self::Swap {
                    amount_in,
                    min_amount_out,
                }
            }
            _ => return Err(AmmError::InvalidInstruction.into()),
        })
    }

    /// Packs an [AmmInstruction](enum.AmmInstruction.html) into a byte buffer.
    pub fn pack(&self) -> Vec<u8> {
        let mut buf = Vec::with_capacity(size_of::<Self>());
        match self {
            &Self::InitializePool {
                fee_numerator,
                fee_denominator,
            } => {
                buf.push(0);
                buf.extend_from_slice(&fee_numerator.to_le_bytes());
                buf.extend_from_slice(&fee_denominator.to_le_bytes());
            }
            &Self::AddLiquidity {
                token_a_amount,
                token_b_amount,
                min_lp_amount,
            } => {
                buf.push(1);
                buf.extend_from_slice(&token_a_amount.to_le_bytes());
                buf.extend_from_slice(&token_b_amount.to_le_bytes());
                buf.extend_from_slice(&min_lp_amount.to_le_bytes());
            }
            &Self::RemoveLiquidity {
                lp_amount,
                min_token_a_amount,
                min_token_b_amount,
            } => {
                buf.push(2);
                buf.extend_from_slice(&lp_amount.to_le_bytes());
                buf.extend_from_slice(&min_token_a_amount.to_le_bytes());
                buf.extend_from_slice(&min_token_b_amount.to_le_bytes());
            }
            &Self::Swap {
                amount_in,
                min_amount_out,
            } => {
                buf.push(3);
                buf.extend_from_slice(&amount_in.to_le_bytes());
                buf.extend_from_slice(&min_amount_out.to_le_bytes());
            }
        };
        buf
    }

    fn unpack_u16(input: &[u8]) -> Result<(u16, &[u8]), ProgramError> {
        let (bytes, rest) = input.split_at(2);
        let value = u16::from_le_bytes(bytes.try_into().unwrap());
        Ok((value, rest))
    }

    fn unpack_u64(input: &[u8]) -> Result<(u64, &[u8]), ProgramError> {
        let (bytes, rest) = input.split_at(8);
        let value = u64::from_le_bytes(bytes.try_into().unwrap());
        Ok((value, rest))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_instruction_packing() {
        let check = |instruction: &AmmInstruction| {
            let packed = instruction.pack();
            let unpacked = AmmInstruction::unpack(&packed).unwrap();
            assert_eq!(*instruction, unpacked);
        };

        check(&AmmInstruction::InitializePool {
            fee_numerator: 25,
            fee_denominator: 10000,
        });

        check(&AmmInstruction::AddLiquidity {
            token_a_amount: 1000,
            token_b_amount: 2000,
            min_lp_amount: 500,
        });

        check(&AmmInstruction::RemoveLiquidity {
            lp_amount: 500,
            min_token_a_amount: 900,
            min_token_b_amount: 1800,
        });

        check(&AmmInstruction::Swap {
            amount_in: 1000,
            min_amount_out: 900,
        });
    }
}
