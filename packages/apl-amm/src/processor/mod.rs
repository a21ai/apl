//! Program processor

use {
    crate::{
        error::AmmError,
        instruction::AmmInstruction,
        state::Pool,
    },
    arch_program::{
        account::{next_account_info, AccountInfo},
        entrypoint::ProgramResult,
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
    // ... [Previous process and process_initialize_pool implementations] ...

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
        let user_token_a_info = next_account_info(account_info_iter)?;
        let user_token_b_info = next_account_info(account_info_iter)?;
        let user_lp_info = next_account_info(account_info_iter)?;
        let user_authority_info = next_account_info(account_info_iter)?;

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
        let user_token_a_info = next_account_info(account_info_iter)?;
        let user_token_b_info = next_account_info(account_info_iter)?;
        let user_lp_info = next_account_info(account_info_iter)?;
        let user_authority_info = next_account_info(account_info_iter)?;

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
        let user_input_info = next_account_info(account_info_iter)?;
        let user_output_info = next_account_info(account_info_iter)?;
        let user_authority_info = next_account_info(account_info_iter)?;

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
