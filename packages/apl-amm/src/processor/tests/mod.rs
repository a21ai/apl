//! Program processor tests

use {
    super::*,
    crate::{
        error::AmmError,
        instruction::AmmInstruction,
        state::Pool,
    },
    arch_program::{
        program_error::ProgramError,
        pubkey::Pubkey,
    },
    super::test_utils::*,
};

#[test]
fn test_initialize_pool() {
    let (program_id, mut accounts) = create_program_test_context();

    // Create accounts
    let mut pool_account = TestAccount::new_system_account();
    let mut token_a_mint = TestAccount::new_token_mint(&Pubkey::new_unique());
    let mut token_b_mint = TestAccount::new_token_mint(&Pubkey::new_unique());
    let mut lp_mint = TestAccount::new_token_mint(&Pubkey::new_unique());
    let mut token_a_vault = TestAccount::new_token_account(&token_a_mint.owner, &program_id);
    let mut token_b_vault = TestAccount::new_token_account(&token_b_mint.owner, &program_id);
    let mut authority = TestAccount {
        is_signer: true,
        ..TestAccount::new_system_account()
    };

    accounts.extend_from_slice(&[
        pool_account.to_account_info(),
        token_a_mint.to_account_info(),
        token_b_mint.to_account_info(),
        lp_mint.to_account_info(),
        token_a_vault.to_account_info(),
        token_b_vault.to_account_info(),
        authority.to_account_info(),
    ]);

    // Test successful initialization
    let instruction = AmmInstruction::InitializePool {
        fee_numerator: 25,
        fee_denominator: 10000,
    };
    let result = Processor::process(&program_id, &accounts, &instruction.pack());
    assert!(result.is_ok());

    // Verify pool state
    let pool = Pool::unpack(&accounts[0].data.borrow()).unwrap();
    assert!(pool.is_initialized);
    assert_eq!(pool.token_a, *token_a_mint.owner);
    assert_eq!(pool.token_b, *token_b_mint.owner);
    assert_eq!(pool.lp_mint, *lp_mint.owner);
    assert_eq!(pool.token_a_vault, *token_a_vault.owner);
    assert_eq!(pool.token_b_vault, *token_b_vault.owner);
    assert_eq!(pool.fee_numerator, 25);
    assert_eq!(pool.fee_denominator, 10000);

    // Test invalid fee configuration
    let instruction = AmmInstruction::InitializePool {
        fee_numerator: 10000,
        fee_denominator: 1000,
    };
    let result = Processor::process(&program_id, &accounts, &instruction.pack());
    assert_eq!(result.unwrap_err(), AmmError::InvalidFeeConfig.into());

    // Test already initialized
    let instruction = AmmInstruction::InitializePool {
        fee_numerator: 25,
        fee_denominator: 10000,
    };
    let result = Processor::process(&program_id, &accounts, &instruction.pack());
    assert_eq!(result.unwrap_err(), AmmError::AlreadyInitialized.into());
}

#[test]
fn test_add_liquidity() {
    let (program_id, mut accounts) = create_program_test_context();

    // Create accounts
    let mut pool_account = TestAccount::new_system_account();
    let mut token_a_vault = TestAccount::new_token_account(&Pubkey::new_unique(), &program_id);
    let mut token_b_vault = TestAccount::new_token_account(&Pubkey::new_unique(), &program_id);
    let mut lp_mint = TestAccount::new_token_mint(&program_id);
    let mut user_token_a = TestAccount::new_token_account(&token_a_vault.owner, &Pubkey::new_unique());
    let mut user_token_b = TestAccount::new_token_account(&token_b_vault.owner, &Pubkey::new_unique());
    let mut user_lp = TestAccount::new_token_account(&lp_mint.owner, &Pubkey::new_unique());
    let mut authority = TestAccount {
        is_signer: true,
        ..TestAccount::new_system_account()
    };

    accounts.extend_from_slice(&[
        pool_account.to_account_info(),
        token_a_vault.to_account_info(),
        token_b_vault.to_account_info(),
        lp_mint.to_account_info(),
        user_token_a.to_account_info(),
        user_token_b.to_account_info(),
        user_lp.to_account_info(),
        authority.to_account_info(),
    ]);

    // Initialize pool first
    let pool = Pool {
        token_a: *token_a_vault.owner,
        token_b: *token_b_vault.owner,
        lp_mint: *lp_mint.owner,
        token_a_vault: *token_a_vault.owner,
        token_b_vault: *token_b_vault.owner,
        fee_numerator: 25,
        fee_denominator: 10000,
        is_initialized: true,
    };
    Pool::pack(pool, &mut accounts[0].data.borrow_mut()).unwrap();

    // Test initial liquidity addition
    let instruction = AmmInstruction::AddLiquidity {
        token_a_amount: 1000,
        token_b_amount: 1000,
        min_lp_amount: 900,
    };
    let result = Processor::process(&program_id, &accounts, &instruction.pack());
    assert!(result.is_ok());

    // Test slippage protection
    let instruction = AmmInstruction::AddLiquidity {
        token_a_amount: 1000,
        token_b_amount: 1000,
        min_lp_amount: 2000,
    };
    let result = Processor::process(&program_id, &accounts, &instruction.pack());
    assert_eq!(result.unwrap_err(), AmmError::SlippageExceeded.into());
}

#[test]
fn test_remove_liquidity() {
    let (program_id, mut accounts) = create_program_test_context();

    // Create accounts
    let mut pool_account = TestAccount::new_system_account();
    let mut token_a_vault = TestAccount::new_token_account(&Pubkey::new_unique(), &program_id);
    let mut token_b_vault = TestAccount::new_token_account(&Pubkey::new_unique(), &program_id);
    let mut lp_mint = TestAccount::new_token_mint(&program_id);
    let mut user_token_a = TestAccount::new_token_account(&token_a_vault.owner, &Pubkey::new_unique());
    let mut user_token_b = TestAccount::new_token_account(&token_b_vault.owner, &Pubkey::new_unique());
    let mut user_lp = TestAccount::new_token_account(&lp_mint.owner, &Pubkey::new_unique());
    let mut authority = TestAccount {
        is_signer: true,
        ..TestAccount::new_system_account()
    };

    accounts.extend_from_slice(&[
        pool_account.to_account_info(),
        token_a_vault.to_account_info(),
        token_b_vault.to_account_info(),
        lp_mint.to_account_info(),
        user_token_a.to_account_info(),
        user_token_b.to_account_info(),
        user_lp.to_account_info(),
        authority.to_account_info(),
    ]);

    // Initialize pool with liquidity
    let pool = Pool {
        token_a: *token_a_vault.owner,
        token_b: *token_b_vault.owner,
        lp_mint: *lp_mint.owner,
        token_a_vault: *token_a_vault.owner,
        token_b_vault: *token_b_vault.owner,
        fee_numerator: 25,
        fee_denominator: 10000,
        is_initialized: true,
    };
    Pool::pack(pool, &mut accounts[0].data.borrow_mut()).unwrap();

    // Test liquidity removal
    let instruction = AmmInstruction::RemoveLiquidity {
        lp_amount: 500,
        min_token_a_amount: 450,
        min_token_b_amount: 450,
    };
    let result = Processor::process(&program_id, &accounts, &instruction.pack());
    assert!(result.is_ok());

    // Test slippage protection
    let instruction = AmmInstruction::RemoveLiquidity {
        lp_amount: 500,
        min_token_a_amount: 1000,
        min_token_b_amount: 1000,
    };
    let result = Processor::process(&program_id, &accounts, &instruction.pack());
    assert_eq!(result.unwrap_err(), AmmError::SlippageExceeded.into());
}

#[test]
fn test_swap() {
    let (program_id, mut accounts) = create_program_test_context();

    // Create accounts
    let mut pool_account = TestAccount::new_system_account();
    let mut input_vault = TestAccount::new_token_account(&Pubkey::new_unique(), &program_id);
    let mut output_vault = TestAccount::new_token_account(&Pubkey::new_unique(), &program_id);
    let mut user_input = TestAccount::new_token_account(&input_vault.owner, &Pubkey::new_unique());
    let mut user_output = TestAccount::new_token_account(&output_vault.owner, &Pubkey::new_unique());
    let mut authority = TestAccount {
        is_signer: true,
        ..TestAccount::new_system_account()
    };

    accounts.extend_from_slice(&[
        pool_account.to_account_info(),
        input_vault.to_account_info(),
        output_vault.to_account_info(),
        user_input.to_account_info(),
        user_output.to_account_info(),
        authority.to_account_info(),
    ]);

    // Initialize pool with liquidity
    let pool = Pool {
        token_a: *input_vault.owner,
        token_b: *output_vault.owner,
        lp_mint: Pubkey::new_unique(),
        token_a_vault: *input_vault.owner,
        token_b_vault: *output_vault.owner,
        fee_numerator: 25,
        fee_denominator: 10000,
        is_initialized: true,
    };
    Pool::pack(pool, &mut accounts[0].data.borrow_mut()).unwrap();

    // Test swap
    let instruction = AmmInstruction::Swap {
        amount_in: 1000,
        min_amount_out: 900,
    };
    let result = Processor::process(&program_id, &accounts, &instruction.pack());
    assert!(result.is_ok());

    // Test slippage protection
    let instruction = AmmInstruction::Swap {
        amount_in: 1000,
        min_amount_out: 2000,
    };
    let result = Processor::process(&program_id, &accounts, &instruction.pack());
    assert_eq!(result.unwrap_err(), AmmError::SlippageExceeded.into());
}
