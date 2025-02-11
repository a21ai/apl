//! Program state processor

use arch_program::{
    account::{next_account_info, AccountInfo}, entrypoint::ProgramResult, msg, program::{invoke, invoke_signed}, program_error::ProgramError, program_pack::Pack, pubkey::Pubkey, system_instruction::SystemInstruction
};

/// Instruction processor
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _input: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let associated_token_account_info = next_account_info(account_info_iter)?;
    let wallet_account_info = next_account_info(account_info_iter)?;
    let spl_token_mint_info = next_account_info(account_info_iter)?;
    let system_program_info = next_account_info(account_info_iter)?;
    let spl_token_program_info = next_account_info(account_info_iter)?;

    let (associated_token_address, bump_seed) = get_associated_token_address_and_bump_seed(
        &wallet_account_info.key,
        &spl_token_mint_info.key,
        program_id,
    );
    if associated_token_address != *associated_token_account_info.key {
        msg!("Error: Associated address does not match seed derivation");
        return Err(ProgramError::InvalidSeeds);
    }

    let associated_token_account_signer_seeds: &[&[_]] = &[
        &wallet_account_info.key.serialize(),
        &apl_token::id().serialize(),
        &spl_token_mint_info.key.serialize(),
        &[bump_seed],
    ];

    msg!("Allocate space for the associated token account");
    invoke_signed(
        &SystemInstruction::new_write_bytes_instruction(
            0,
            apl_token::state::Account::LEN as u32,
            vec![0; apl_token::state::Account::LEN],
            associated_token_account_info.key.clone(),
        ),
        &[
            associated_token_account_info.clone(),
            system_program_info.clone(),
        ],
        &[&associated_token_account_signer_seeds],
    )?;

    msg!("Assign the associated token account to the SPL Token program");
    invoke_signed(
        &SystemInstruction::new_assign_ownership_instruction(associated_token_account_info.key.clone(), apl_token::id()),
        &[
            associated_token_account_info.clone(),
            system_program_info.clone(),
        ],
        &[&associated_token_account_signer_seeds],
    )?;

    msg!("Initialize the associated token account");
    invoke(
        &apl_token::instruction::initialize_account(
            &apl_token::id(),
            associated_token_account_info.key,
            spl_token_mint_info.key,
            wallet_account_info.key,
        )?,
        &[
            associated_token_account_info.clone(),
            spl_token_mint_info.clone(),
            wallet_account_info.clone(),
            spl_token_program_info.clone(),
        ],
    )
}

pub fn id() -> Pubkey {
    Pubkey::from_slice(b"associated-token-account00000000")
}

pub(crate) fn get_associated_token_address_and_bump_seed(
    wallet_address: &Pubkey,
    spl_token_mint_address: &Pubkey,
    program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            &wallet_address.serialize(),
            &apl_token::id().serialize(),
            &spl_token_mint_address.serialize(),
        ],
        program_id,
    )
}