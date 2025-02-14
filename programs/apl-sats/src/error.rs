use arch_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SatsError {
    #[error("Invalid instruction")]
    InvalidInstruction,

    #[error("Invalid mint authority")]
    InvalidMintAuthority,

    #[error("Invalid burn authority")]
    InvalidBurnAuthority,

    #[error("Invalid UTXO")]
    InvalidUtxo,

    #[error("Insufficient balance")]
    InsufficientBalance,

    #[error("Invalid Bitcoin address")]
    InvalidBitcoinAddress,
}

impl From<SatsError> for ProgramError {
    fn from(e: SatsError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
