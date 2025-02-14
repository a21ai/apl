//! Program state processor

mod tools;

use arch_program::{
    account::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    system_instruction,
};
use tools::create_pda_account;

#[cfg(not(feature = "no-entrypoint"))]
use arch_program::entrypoint;

#[cfg(not(feature = "no-entrypoint"))]
entrypoint!(process_instruction);

/// Instruction processor
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let associated_token_account_info = next_account_info(account_info_iter)?;
    let wallet_account_info = next_account_info(account_info_iter)?;
    let spl_token_mint_info = next_account_info(account_info_iter)?;
    let system_program_info = next_account_info(account_info_iter)?;
    let spl_token_program_info = next_account_info(account_info_iter)?;

    if input.len() < 36 {
        msg!("Error: Instruction data has incorrect length");
        return Err(ProgramError::InvalidInstructionData);
    }

    let txid: [u8; 32] = input[0..32].try_into().unwrap();
    let vout = u32::from_le_bytes(input[32..36].try_into().unwrap());

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

    create_pda_account(
        txid,
        vout,
        system_program_info,
        associated_token_account_info,
        associated_token_account_signer_seeds,
    )?;

    msg!("Allocate space for the associated token account");
    invoke_signed(
        &system_instruction::write_bytes(
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

    msg!("Assign the associated token account to the APL Token program");
    invoke_signed(
        &system_instruction::assign(associated_token_account_info.key.clone(), apl_token::id()),
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
