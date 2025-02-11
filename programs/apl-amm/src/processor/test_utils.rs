//! Test utilities

use {
    arch_program::{
        account::AccountInfo,
        program_error::ProgramError,
        pubkey::Pubkey,
        rent::Rent,
    },
    std::cell::RefCell,
};

pub struct TestAccount {
    pub is_signer: bool,
    pub is_writable: bool,
    pub lamports: u64,
    pub data: Vec<u8>,
    pub owner: Pubkey,
    pub executable: bool,
    pub rent_epoch: u64,
}

impl TestAccount {
    pub fn new_system_account() -> Self {
        Self {
            is_signer: false,
            is_writable: true,
            lamports: 0,
            data: vec![],
            owner: Pubkey::default(),
            executable: false,
            rent_epoch: 0,
        }
    }

    pub fn new_token_mint(authority: &Pubkey) -> Self {
        let mut account = Self::new_system_account();
        account.data = vec![0; 82]; // Mint::LEN
        account.data[0..32].copy_from_slice(authority.as_ref());
        account.data[45] = 1; // is_initialized
        account
    }

    pub fn new_token_account(mint: &Pubkey, owner: &Pubkey) -> Self {
        let mut account = Self::new_system_account();
        account.data = vec![0; 165]; // Account::LEN
        account.data[0..32].copy_from_slice(mint.as_ref());
        account.data[32..64].copy_from_slice(owner.as_ref());
        account.data[108] = 1; // initialized state
        account
    }

    pub fn to_account_info(&mut self) -> AccountInfo {
        AccountInfo::new(
            &self.owner,
            self.is_signer,
            self.is_writable,
            &mut self.lamports,
            &mut self.data,
            &self.owner,
            self.executable,
            self.rent_epoch,
        )
    }
}

pub fn create_program_test_context() -> (Pubkey, Vec<AccountInfo>) {
    let program_id = Pubkey::new_unique();
    let mut accounts = vec![];
    (program_id, accounts)
}
