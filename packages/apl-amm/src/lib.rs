pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;

use arch_program::{
    account::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    if let Err(error) = processor::Processor::process(program_id, accounts, instruction_data) {
        return Err(error);
    }
    Ok(())
}
