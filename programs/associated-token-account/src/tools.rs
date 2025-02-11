use arch_program::{
    account::AccountInfo, entrypoint::ProgramResult, program::invoke_signed, system_instruction,
};

/// Creates associated token account using Program Derived Address for the given
/// seeds
pub fn create_pda_account<'a>(
    txid: [u8; 32],
    vout: u32,
    system_program: &AccountInfo<'a>,
    new_pda_account: &AccountInfo<'a>,
    new_pda_signer_seeds: &[&[u8]],
) -> ProgramResult {
    invoke_signed(
        &system_instruction::create_account(txid, vout, new_pda_account.key.clone()),
        &[new_pda_account.clone(), system_program.clone()],
        &[new_pda_signer_seeds],
    )

    // invoke_signed(
    //     &SystemInstruction::new_assign_ownership_instruction(
    //         new_pda_account.key.clone(),
    //         owner.clone(),
    //     ),
    //     &[new_pda_account.clone(), system_program.clone()],
    //     &[new_pda_signer_seeds],
    // )
}
