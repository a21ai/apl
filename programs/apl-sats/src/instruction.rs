use bitcoin::{OutPoint, Txid};
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct SerializableOutPoint {
    pub txid: [u8; 32],
    pub vout: u32,
}

impl From<OutPoint> for SerializableOutPoint {
    fn from(outpoint: OutPoint) -> Self {
        Self {
            txid: outpoint.txid.to_byte_array(),
            vout: outpoint.vout,
        }
    }
}

impl From<SerializableOutPoint> for OutPoint {
    fn from(outpoint: SerializableOutPoint) -> Self {
        OutPoint {
            txid: Txid::from_slice(&outpoint.txid).unwrap(),
            vout: outpoint.vout,
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum SatsInstruction {
    /// Initialize a new UTXO vault
    ///
    /// Accounts expected:
    /// 0. `[signer]` The authority that will manage the vault
    /// 1. `[writable]` The vault account to initialize
    /// 2. `[writable]` The mint account for wrapped tokens
    /// 3. `[]` The system program
    /// 4. `[]` The token program
    InitializeVault,

    /// Deposit a Bitcoin UTXO
    DepositUtxo {
        /// The Bitcoin UTXO to deposit
        outpoint: SerializableOutPoint,
        /// Amount of satoshis
        amount: u64,
        /// Bitcoin script pubkey
        script_pubkey: Vec<u8>,
    },

    /// Withdraw Bitcoin
    WithdrawUtxo {
        /// Amount of satoshis to withdraw
        amount: u64,
        /// Bitcoin address to receive the withdrawal
        bitcoin_address: String,
    },
}
