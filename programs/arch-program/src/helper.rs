use std::str::FromStr;

use bitcoin::{
    absolute::LockTime, transaction::Version, OutPoint, ScriptBuf, Sequence, Transaction, TxIn,
    TxOut, Txid, Witness,
};

use crate::{
    account::AccountInfo,
    msg,
    program::{get_account_script_pubkey, get_bitcoin_tx},
};

pub fn get_state_transition_tx(accounts: &[AccountInfo]) -> Transaction {
    Transaction {
        version: Version::TWO,
        lock_time: LockTime::ZERO,
        input: accounts
            .iter()
            .filter(|account| account.is_writable)
            .map(|account| TxIn {
                previous_output: OutPoint {
                    txid: Txid::from_str(&hex::encode(account.utxo.txid())).unwrap(),
                    vout: account.utxo.vout(),
                },
                script_sig: ScriptBuf::new(),
                sequence: Sequence::MAX,
                witness: Witness::new(),
            })
            .collect::<Vec<TxIn>>(),
        output: accounts
            .iter()
            .filter(|account| account.is_writable)
            .map(|account| {
                let tx: Transaction = bitcoin::consensus::deserialize(
                    &get_bitcoin_tx(account.utxo.txid().try_into().unwrap()).unwrap(),
                )
                .unwrap();

                TxOut {
                    value: tx.output[account.utxo.vout() as usize].value,
                    script_pubkey: ScriptBuf::from_bytes(
                        get_account_script_pubkey(account.key).to_vec(),
                    ),
                }
            })
            .collect::<Vec<TxOut>>(),
    }
}

pub fn add_state_transition(transaction: &mut Transaction, account: &AccountInfo) {
    assert!(account.is_writable);

    // Create input on heap to avoid large stack allocations
    let txid = Txid::from_str(&hex::encode(account.utxo.txid())).unwrap();
    let input = Box::new(TxIn {
        previous_output: OutPoint {
            txid,
            vout: account.utxo.vout(),
        },
        script_sig: ScriptBuf::new(),
        sequence: Sequence::MAX,
        witness: Witness::new(),
    });
    transaction.input.push(*input);

    msg!("account utxo : {:?}", hex::encode(account.utxo.txid()));

    // Get bitcoin tx data and create output on heap
    let tx_data = get_bitcoin_tx(account.utxo.txid().try_into().unwrap()).unwrap();
    let tx: Transaction = bitcoin::consensus::deserialize(&tx_data).unwrap();

    let script_pubkey = ScriptBuf::from_bytes(get_account_script_pubkey(account.key).to_vec());
    let output = Box::new(TxOut {
        value: tx.output[account.utxo.vout() as usize].value,
        script_pubkey,
    });
    transaction.output.push(*output);
}
