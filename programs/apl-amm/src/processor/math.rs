//! Math utilities for AMM operations

use crate::error::AmmError;
use arch_program::program_error::ProgramError;

/// Calculates the output amount for a swap using constant product formula
pub fn calculate_swap_output(
    amount_in: u64,
    reserve_in: u64,
    reserve_out: u64,
    fee_numerator: u16,
    fee_denominator: u16,
) -> Result<u64, ProgramError> {
    // Calculate fee-adjusted input
    let fee_amount = (amount_in as u128)
        .checked_mul(fee_numerator as u128)
        .ok_or(AmmError::MathOverflow)?
        .checked_div(fee_denominator as u128)
        .ok_or(AmmError::MathOverflow)?;
    
    let amount_in_after_fee = (amount_in as u128)
        .checked_sub(fee_amount)
        .ok_or(AmmError::MathOverflow)?;

    // Calculate output using constant product formula
    // (x + dx)(y - dy) = xy
    // dy = y * dx / (x + dx)
    let numerator = amount_in_after_fee
        .checked_mul(reserve_out as u128)
        .ok_or(AmmError::MathOverflow)?;
    
    let denominator = (reserve_in as u128)
        .checked_add(amount_in_after_fee)
        .ok_or(AmmError::MathOverflow)?;

    let amount_out = numerator
        .checked_div(denominator)
        .ok_or(AmmError::MathOverflow)?;

    // Convert back to u64
    if amount_out > u64::MAX as u128 {
        return Err(AmmError::MathOverflow.into());
    }

    Ok(amount_out as u64)
}

/// Calculates the minimum LP token amount for initial deposit
pub fn calculate_initial_lp_amount(
    token_a_amount: u64,
    token_b_amount: u64,
) -> Result<u64, ProgramError> {
    // For initial deposit, LP amount is geometric mean of deposits
    let product = (token_a_amount as u128)
        .checked_mul(token_b_amount as u128)
        .ok_or(AmmError::MathOverflow)?;

    let sqrt_product = integer_sqrt(product);
    
    if sqrt_product > u64::MAX as u128 {
        return Err(AmmError::MathOverflow.into());
    }

    Ok(sqrt_product as u64)
}

/// Calculates LP tokens to mint for subsequent deposits
pub fn calculate_lp_amount(
    token_a_amount: u64,
    token_b_amount: u64,
    token_a_reserve: u64,
    token_b_reserve: u64,
    lp_supply: u64,
) -> Result<u64, ProgramError> {
    // LP amount is proportional to share of pool
    let share_a = (token_a_amount as u128)
        .checked_mul(lp_supply as u128)
        .ok_or(AmmError::MathOverflow)?
        .checked_div(token_a_reserve as u128)
        .ok_or(AmmError::MathOverflow)?;

    let share_b = (token_b_amount as u128)
        .checked_mul(lp_supply as u128)
        .ok_or(AmmError::MathOverflow)?
        .checked_div(token_b_reserve as u128)
        .ok_or(AmmError::MathOverflow)?;

    // Use smaller share to prevent dilution
    let lp_amount = std::cmp::min(share_a, share_b);
    
    if lp_amount > u64::MAX as u128 {
        return Err(AmmError::MathOverflow.into());
    }

    Ok(lp_amount as u64)
}

/// Integer square root using the Babylonian method
fn integer_sqrt(value: u128) -> u128 {
    if value < 2 {
        return value;
    }

    let mut x = value;
    let mut y = (x + 1) >> 1;

    while y < x {
        x = y;
        y = (x + value / x) >> 1;
    }

    x
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_swap_output() {
        // Test basic swap
        let amount_out = calculate_swap_output(100, 1000, 1000, 25, 10000).unwrap();
        assert_eq!(amount_out, 90); // ~10% less due to fees and slippage

        // Test zero input
        let amount_out = calculate_swap_output(0, 1000, 1000, 25, 10000).unwrap();
        assert_eq!(amount_out, 0);

        // Test large numbers
        let amount_out = calculate_swap_output(
            1_000_000,
            10_000_000,
            10_000_000,
            25,
            10000,
        ).unwrap();
        assert!(amount_out > 900_000); // ~10% less due to fees and slippage
    }

    #[test]
    fn test_calculate_initial_lp_amount() {
        // Test equal amounts
        let lp_amount = calculate_initial_lp_amount(1000, 1000).unwrap();
        assert_eq!(lp_amount, 1000);

        // Test unequal amounts
        let lp_amount = calculate_initial_lp_amount(1000, 4000).unwrap();
        assert_eq!(lp_amount, 2000);
    }

    #[test]
    fn test_calculate_lp_amount() {
        // Test 10% of pool
        let lp_amount = calculate_lp_amount(100, 100, 1000, 1000, 1000).unwrap();
        assert_eq!(lp_amount, 100);

        // Test uneven ratio (should use smaller share)
        let lp_amount = calculate_lp_amount(200, 100, 1000, 1000, 1000).unwrap();
        assert_eq!(lp_amount, 100);
    }
}
