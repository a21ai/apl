use arch_program::{
    account::AccountInfo, declare_id, entrypoint, entrypoint::ProgramResult,
    program_error::ProgramError, pubkey::Pubkey,
};
use borsh::BorshDeserialize;

pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;
pub mod utils;

use crate::{instruction::SatsInstruction, processor::Processor};

declare_id!("APLSatsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

// Program entrypoint
entrypoint!(process_instruction);

/// Process instruction
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Unpack instruction data
    let instruction = SatsInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    // Process instruction
    Processor::process(program_id, accounts, instruction)
}
