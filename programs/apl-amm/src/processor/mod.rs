//! Program processor

use {
    crate::{error::AmmError, instruction::AmmInstruction, state::Pool},
    arch_program::{
        account::{next_account_info, AccountInfo},
        entrypoint::ProgramResult,
        msg,
        program_error::ProgramError,
        program_pack::Pack,
        pubkey::Pubkey,
    },
};

mod math;
use math::*;

/// Program state handler.
pub struct Processor {}

impl Processor {
    /// Processes an instruction
    pub fn process(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = AmmInstruction::unpack(instruction_data)?;

        match instruction {
            AmmInstruction::InitializePool {
                fee_numerator,
                fee_denominator,
            } => {
                msg!("Instruction: InitializePool");
                Self::process_initialize_pool(accounts, fee_numerator, fee_denominator)
            }
            AmmInstruction::AddLiquidity {
                token_a_amount,
                token_b_amount,
                min_lp_amount,
            } => {
                msg!("Instruction: AddLiquidity");
                Self::process_add_liquidity(accounts, token_a_amount, token_b_amount, min_lp_amount)
            }
            AmmInstruction::RemoveLiquidity {
                lp_amount,
                min_token_a_amount,
                min_token_b_amount,
            } => {
                msg!("Instruction: RemoveLiquidity");
                Self::process_remove_liquidity(
                    accounts,
                    lp_amount,
                    min_token_a_amount,
                    min_token_b_amount,
                )
            }
            AmmInstruction::Swap {
                amount_in,
                min_amount_out,
            } => {
                msg!("Instruction: Swap");
                Self::process_swap(accounts, amount_in, min_amount_out)
            }
        }
    }

    /// Processes an [InitializePool](enum.Instruction.html) instruction.
    pub fn process_initialize_pool(
        accounts: &[AccountInfo],
        fee_numerator: u16,
        fee_denominator: u16,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let pool_info = next_account_info(account_info_iter)?;
        let token_a_mint_info = next_account_info(account_info_iter)?;
        let token_b_mint_info = next_account_info(account_info_iter)?;
        let lp_mint_info = next_account_info(account_info_iter)?;
        let token_a_vault_info = next_account_info(account_info_iter)?;
        let token_b_vault_info = next_account_info(account_info_iter)?;
        let _authority_info = next_account_info(account_info_iter)?;

        // Validate pool state
        let mut pool = Pool::unpack_unchecked(&pool_info.data.borrow())?;
        if pool.is_initialized {
            return Err(AmmError::AlreadyInitialized.into());
        }

        // Validate fee configuration
        if fee_numerator == 0 || fee_denominator == 0 || fee_numerator >= fee_denominator {
            return Err(AmmError::InvalidFeeConfig.into());
        }

        // Initialize pool
        pool.token_a = *token_a_mint_info.key;
        pool.token_b = *token_b_mint_info.key;
        pool.lp_mint = *lp_mint_info.key;
        pool.token_a_vault = *token_a_vault_info.key;
        pool.token_b_vault = *token_b_vault_info.key;
        pool.fee_numerator = fee_numerator;
        pool.fee_denominator = fee_denominator;
        pool.is_initialized = true;

        Pool::pack(pool, &mut pool_info.data.borrow_mut())?;

        Ok(())
    }

    /// Processes an [AddLiquidity](enum.Instruction.html) instruction.
    pub fn process_add_liquidity(
        accounts: &[AccountInfo],
        token_a_amount: u64,
        token_b_amount: u64,
        min_lp_amount: u64,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let pool_info = next_account_info(account_info_iter)?;
        let token_a_vault_info = next_account_info(account_info_iter)?;
        let token_b_vault_info = next_account_info(account_info_iter)?;
        let lp_mint_info = next_account_info(account_info_iter)?;
        let _user_token_a_info = next_account_info(account_info_iter)?;
        let _user_token_b_info = next_account_info(account_info_iter)?;
        let _user_lp_info = next_account_info(account_info_iter)?;
        let _user_authority_info = next_account_info(account_info_iter)?;

        // Validate pool state
        let pool = Pool::unpack(&pool_info.data.borrow())?;
        if !pool.is_initialized {
            return Err(AmmError::InvalidPoolState.into());
        }

        // Get current vault balances
        let token_a_reserve = token_a_vault_info.try_borrow_data()?[64..72]
            .try_into()
            .map(u64::from_le_bytes)
            .map_err(|_| AmmError::InvalidPoolState)?;
        let token_b_reserve = token_b_vault_info.try_borrow_data()?[64..72]
            .try_into()
            .map(u64::from_le_bytes)
            .map_err(|_| AmmError::InvalidPoolState)?;
        let lp_supply = lp_mint_info.try_borrow_data()?[36..44]
            .try_into()
            .map(u64::from_le_bytes)
            .map_err(|_| AmmError::InvalidPoolState)?;

        // Calculate LP tokens to mint
        let lp_amount = if lp_supply == 0 {
            calculate_initial_lp_amount(token_a_amount, token_b_amount)?
        } else {
            calculate_lp_amount(
                token_a_amount,
                token_b_amount,
                token_a_reserve,
                token_b_reserve,
                lp_supply,
            )?
        };

        if lp_amount < min_lp_amount {
            return Err(AmmError::SlippageExceeded.into());
        }

        // TODO: Transfer tokens using CPI
        // 1. Transfer token A from user to vault
        // 2. Transfer token B from user to vault
        // 3. Mint LP tokens to user

        Ok(())
    }

    /// Processes a [RemoveLiquidity](enum.Instruction.html) instruction.
    pub fn process_remove_liquidity(
        accounts: &[AccountInfo],
        lp_amount: u64,
        min_token_a_amount: u64,
        min_token_b_amount: u64,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let pool_info = next_account_info(account_info_iter)?;
        let token_a_vault_info = next_account_info(account_info_iter)?;
        let token_b_vault_info = next_account_info(account_info_iter)?;
        let lp_mint_info = next_account_info(account_info_iter)?;
        let _user_token_a_info = next_account_info(account_info_iter)?;
        let _user_token_b_info = next_account_info(account_info_iter)?;
        let _user_lp_info = next_account_info(account_info_iter)?;
        let _user_authority_info = next_account_info(account_info_iter)?;

        // Validate pool state
        let pool = Pool::unpack(&pool_info.data.borrow())?;
        if !pool.is_initialized {
            return Err(AmmError::InvalidPoolState.into());
        }

        // Get current vault balances
        let token_a_reserve = token_a_vault_info.try_borrow_data()?[64..72]
            .try_into()
            .map(u64::from_le_bytes)
            .map_err(|_| AmmError::InvalidPoolState)?;
        let token_b_reserve = token_b_vault_info.try_borrow_data()?[64..72]
            .try_into()
            .map(u64::from_le_bytes)
            .map_err(|_| AmmError::InvalidPoolState)?;
        let lp_supply = lp_mint_info.try_borrow_data()?[36..44]
            .try_into()
            .map(u64::from_le_bytes)
            .map_err(|_| AmmError::InvalidPoolState)?;

        // Calculate token amounts
        let token_a_amount = (token_a_reserve as u128)
            .checked_mul(lp_amount as u128)
            .ok_or(AmmError::MathOverflow)?
            .checked_div(lp_supply as u128)
            .ok_or(AmmError::MathOverflow)? as u64;

        let token_b_amount = (token_b_reserve as u128)
            .checked_mul(lp_amount as u128)
            .ok_or(AmmError::MathOverflow)?
            .checked_div(lp_supply as u128)
            .ok_or(AmmError::MathOverflow)? as u64;

        if token_a_amount < min_token_a_amount || token_b_amount < min_token_b_amount {
            return Err(AmmError::SlippageExceeded.into());
        }

        // TODO: Transfer tokens using CPI
        // 1. Burn LP tokens
        // 2. Transfer token A from vault to user
        // 3. Transfer token B from vault to user

        Ok(())
    }

    /// Processes a [Swap](enum.Instruction.html) instruction.
    pub fn process_swap(
        accounts: &[AccountInfo],
        amount_in: u64,
        min_amount_out: u64,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let pool_info = next_account_info(account_info_iter)?;
        let input_vault_info = next_account_info(account_info_iter)?;
        let output_vault_info = next_account_info(account_info_iter)?;
        let _user_input_info = next_account_info(account_info_iter)?;
        let _user_output_info = next_account_info(account_info_iter)?;
        let _user_authority_info = next_account_info(account_info_iter)?;

        // Validate pool state
        let pool = Pool::unpack(&pool_info.data.borrow())?;
        if !pool.is_initialized {
            return Err(AmmError::InvalidPoolState.into());
        }

        // Get current vault balances
        let reserve_in = input_vault_info.try_borrow_data()?[64..72]
            .try_into()
            .map(u64::from_le_bytes)
            .map_err(|_| AmmError::InvalidPoolState)?;
        let reserve_out = output_vault_info.try_borrow_data()?[64..72]
            .try_into()
            .map(u64::from_le_bytes)
            .map_err(|_| AmmError::InvalidPoolState)?;

        // Calculate output amount
        let amount_out = calculate_swap_output(
            amount_in,
            reserve_in,
            reserve_out,
            pool.fee_numerator,
            pool.fee_denominator,
        )?;

        if amount_out < min_amount_out {
            return Err(AmmError::SlippageExceeded.into());
        }

        // TODO: Transfer tokens using CPI
        // 1. Transfer input tokens from user to vault
        // 2. Transfer output tokens from vault to user

        Ok(())
    }

    /// Checks that the account is owned by the expected program
    pub fn check_account_owner(account_info: &AccountInfo, program_id: &Pubkey) -> ProgramResult {
        if account_info.owner != program_id {
            Err(ProgramError::IncorrectProgramId)
        } else {
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // TODO: Add tests for each instruction
    // - test_initialize_pool
    // - test_add_liquidity
    // - test_remove_liquidity
    // - test_swap
}
