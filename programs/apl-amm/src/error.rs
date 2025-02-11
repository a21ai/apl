//! Error types

use {
    num_derive::FromPrimitive,
    arch_program::{
        decode_error::DecodeError,
        msg,
        program_error::{PrintProgramError, ProgramError},
    },
    thiserror::Error,
};

/// Errors that may be returned by the AMM program.
#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum AmmError {
    /// Pool has already been initialized
    #[error("Pool already initialized")]
    AlreadyInitialized,
    /// Invalid fee configuration
    #[error("Invalid fee configuration")]
    InvalidFeeConfig,
    /// Insufficient liquidity for operation
    #[error("Insufficient liquidity")]
    InsufficientLiquidity,
    /// Slippage tolerance exceeded
    #[error("Slippage exceeded")]
    SlippageExceeded,
    /// Invalid pool tokens provided
    #[error("Invalid pool tokens")]
    InvalidPoolTokens,
    /// Invalid pool state
    #[error("Invalid pool state")]
    InvalidPoolState,
    /// Math operation overflow
    #[error("Math operation overflow")]
    MathOverflow,
}

impl From<AmmError> for ProgramError {
    fn from(e: AmmError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for AmmError {
    fn type_of() -> &'static str {
        "AmmError"
    }
}

impl PrintProgramError for AmmError {
    fn print<E>(&self)
    where
        E: 'static
            + std::error::Error
            + DecodeError<E>
            + PrintProgramError
            + num_traits::FromPrimitive,
    {
        match self {
            AmmError::AlreadyInitialized => msg!("Error: Pool already initialized"),
            AmmError::InvalidFeeConfig => msg!("Error: Invalid fee configuration"),
            AmmError::InsufficientLiquidity => msg!("Error: Insufficient liquidity"),
            AmmError::SlippageExceeded => msg!("Error: Slippage tolerance exceeded"),
            AmmError::InvalidPoolTokens => msg!("Error: Invalid pool tokens"),
            AmmError::InvalidPoolState => msg!("Error: Invalid pool state"),
            AmmError::MathOverflow => msg!("Error: Math operation overflow"),
        }
    }
}
