const DB_MAGIC: &str = "bdk_wallet_electrum_example";
const SEND_AMOUNT: Amount = Amount::from_sat(5000);
const STOP_GAP: usize = 50;
const BATCH_SIZE: usize = 5;

use std::str::FromStr;
use anyhow::anyhow;
use std::io::Write;


use ::bdk_wallet::{bitcoin::{io::Error, FeeRate, Network, OutPoint, Script, Weight}, wallet::coin_selection::{decide_change, CoinSelectionAlgorithm, CoinSelectionResult}, Wallet, WeightedUtxo};
use serde::Serialize;
use bdk_wallet::wallet::coin_selection::Error::InsufficientFunds;
use bdk_electrum::electrum_client;
use bdk_electrum::BdkElectrumClient;
use bdk_file_store::Store;
use bdk_wallet::bitcoin::{Address, Amount};
use bdk_wallet::chain::collections::HashSet;
use bdk_wallet::{KeychainKind, SignOptions};

const TXIN_BASE_WEIGHT: usize = 164; // Base weight units for a SegWit input




#[derive(Serialize)]
pub struct WalletInfo {
    confirmed_balance: u64,
    new_address: String,
    utxos: Vec<UtxoInfo>,
}

#[derive(Serialize)]
pub struct UtxoInfo {
    txid: String,
    value: u64,
}


#[derive(Serialize)]
pub struct CreatePsbtInput<'a> {
    pub descriptor: &'a str,
    pub change_descriptor: Option<&'a str>,
    pub amount: u64,
    pub recipient: &'a str,
    pub utxo_txids: Vec<&'a str>,
    pub fee: f32,
    pub url: &'a str,
    pub network: Network
}

#[derive(Debug)]


// pub struct CustomCoinSelection {
//     specific_utxos: Vec<OutPoint>,
// }

// impl CoinSelectionAlgorithm for CustomCoinSelection {
//     fn coin_select(
//         &self,       
//         required_utxos: Vec<WeightedUtxo>,
//         optional_utxos: Vec<WeightedUtxo>,
//         fee_rate: FeeRate,
//         target_amount: u64,
//         drain_script: &Script,
//     ) -> Result<CoinSelectionResult, bdk_wallet::wallet::coin_selection::Error> {
//         println!("fee_rate: {:#?}", fee_rate);
//         let mut selected_amount = 0;
//         let mut additional_weight = Weight::ZERO;

//         // Filter UTXOs based on specified OutPoints
//         let selected_utxos = required_utxos
//             .into_iter()
//             .chain(optional_utxos)
//             .filter(|weighted_utxo| self.specific_utxos.contains(&weighted_utxo.utxo.outpoint()))
//             .scan(
//                 (&mut selected_amount, &mut additional_weight),
//                 |(selected_amount, additional_weight), weighted_utxo| {
//                     **selected_amount += weighted_utxo.utxo.txout().value;
//                     **additional_weight += Weight::from_wu(
//                         (TXIN_BASE_WEIGHT + weighted_utxo.satisfaction_weight) as u64,
//                     );
//                     Some(weighted_utxo.utxo)
//                 },
//             )
//             .collect::<Vec<_>>();

//         let additional_fees = fee_rate.fee_wu(additional_weight);
        

//         let amount_needed_with_fees = additional_fees + target_amount;

//         if selected_amount < amount_needed_with_fees {
//             return Err(InsufficientFunds{
//                 needed: amount_needed_with_fees,
//                 available: selected_amount,
//             });
//         }

//         let remaining_amount = selected_amount - amount_needed_with_fees;
//         let excess = decide_change(remaining_amount, fee_rate, drain_script);


//         Ok(CoinSelectionResult {
//             selected: selected_utxos,
//             fee_amount: additional_fees,
//             excess,
//         })
//     }
// }



pub struct AppWallet {
   
}

impl AppWallet {
    

    pub fn get_info_by_descriptor(
        descriptor: &str,
        change_descriptor: &str,
        url: &str,
        network: Network
    ) -> Result<WalletInfo, anyhow::Error> {

        let db_path = std::env::temp_dir().join("bdk-electrum-example");
        let mut db =
            Store::<bdk_wallet::wallet::ChangeSet>::open_or_create_new(DB_MAGIC.as_bytes(), db_path)?;
        let external_descriptor = descriptor;
        let internal_descriptor = change_descriptor;
        let changeset = db
            .aggregate_changesets()
            .map_err(|e| anyhow!("load changes error: {}", e))?;
        let mut wallet = Wallet::new_or_load(
            external_descriptor,
            internal_descriptor,
            changeset,
            network,
        )?;
    
        let address = wallet.next_unused_address(KeychainKind::External);
        if let Some(changeset) = wallet.take_staged() {
            db.append_changeset(&changeset)?;
        }
        println!("Generated Address: {}", address);
    
        let balance = wallet.balance();
        println!("Wallet balance before syncing: {} sats", balance.total());
    
        print!("Syncing...");
        let client = BdkElectrumClient::new(electrum_client::Client::new(
            url,
        )?);
    
        // Populate the electrum client's transaction cache so it doesn't redownload transaction we
        // already have.
        client.populate_tx_cache(&wallet);
    
        let request = wallet
            .start_full_scan()
            .inspect_spks_for_all_keychains({
                let mut once = HashSet::<KeychainKind>::new();
                move |k, spk_i, _| {
                    if once.insert(k) {
                        print!("\nScanning keychain [{:?}]", k)
                    } else {
                        print!(" {:<3}", spk_i)
                    }
                }
            })
            .inspect_spks_for_all_keychains(|_, _, _| std::io::stdout().flush().expect("must flush"));
    
        let mut update = client
            .full_scan(request, STOP_GAP, BATCH_SIZE, false)?
            .with_confirmation_time_height_anchor(&client)?;
    
        let now = std::time::UNIX_EPOCH.elapsed().unwrap().as_secs();
        let _ = update.graph_update.update_last_seen_unconfirmed(now);
    
        println!();
    
        wallet.apply_update(update)?;
        if let Some(changeset) = wallet.take_staged() {
            db.append_changeset(&changeset)?;
        }
    
        let balance = wallet.balance();
        println!("Wallet balance after syncing: {} sats", balance.total());
    
        if balance.total() < SEND_AMOUNT {
            println!(
                "Please send at least {} sats to the receiving address",
                SEND_AMOUNT
            );
            std::process::exit(0);
        }
        let utxos = wallet.list_unspent();
        let utxos_with_txid_and_value = utxos.into_iter().map(|utxo| UtxoInfo {
            txid: utxo.outpoint.txid.to_string(),
            value: utxo.txout.value.to_sat(),
        }).collect();
    
        Ok(WalletInfo {
            confirmed_balance: balance.confirmed.to_sat(),
            new_address: address.address.to_string(),
            utxos: utxos_with_txid_and_value,
        })
    }


   
    // pub fn broadcast_psbt(
    //     descriptor: &str,
    //     change_descriptor: Option<&str>,
    //     url: &str,
    //     network: bdk::bitcoin::Network,
    //     psbt: String,
    // ) -> Result<String, bdk::Error> {
        
       
    //     let client = Client::new(url)?;
    //     let blockchain = ElectrumBlockchain::from(client);
    //     let wallet: Wallet<MemoryDatabase> = Wallet::new(
    //         descriptor,
    //         change_descriptor,
    //         network,         
    //         MemoryDatabase::default(),
    //     )?;
    
    //     wallet.sync(&blockchain, SyncOptions::default())?;
       
    //    let psbt = base64::decode(&psbt).map_err(|e| bdk::Error::Generic(e.to_string()))?;
    //    let psbt: PartiallySignedTransaction = bdk_wallet::deserialize(&psbt)?;

    //     let sign_options = SignOptions::default();
  
    //     // Under the hood this uses `rust-bitcoin`'s psbt utilities to finalize the scriptSig and scriptWitness
    //     let _psbt_is_finalized = wallet.finalize_psbt(&mut psbt, sign_options)?;
  
    //     // Get the transaction out of the PSBT so we can broadcast it
    //     let tx = psbt.extract_tx();
  
    //     // Broadcast the transaction using our chosen backend, returning a `Txid` or an error
    //     let txid = wallet.broadcast(tx)?;
  
    //     println!("{:#?}", txid);
  
    //     Ok(txid.to_string())

    // }


    // pub fn create_psbt(
    //     CreatePsbtInput {
    //         descriptor,
    //         change_descriptor,
    //         amount,
    //         recipient,
    //         utxo_txids,
    //         fee,
    //         url,
    //         network
    //     }: CreatePsbtInput
    // ) -> Result<String, bdk::Error> {
    //     let client = Client::new(url)?;
    //     let blockchain = ElectrumBlockchain::from(client);
    //     let wallet = Wallet::new(
    //         descriptor,
    //         change_descriptor,
    //         network,         
    //         MemoryDatabase::default(),
    //     )?;
    
    //     wallet.sync(&blockchain, SyncOptions::default())?;
    
        
    //     let dest_script = bdk::bitcoin::Address::from_str(recipient); // .script_pubkey();
    //     let dest_script = match dest_script {
    //         Ok(script) => script.payload.script_pubkey(),
    //         Err(_) => return Err(bdk::Error::Generic("Invalid address".to_string())),
    //     };

     

    //     let official_utxos = wallet.list_unspent()?;

    //     let official_utxo_included_in_specific_utxos = official_utxos
    // .iter()
    // .filter(|utxo| utxo_txids.contains(&utxo.outpoint.txid.to_string().as_str()))
    // .collect::<Vec<_>>();

  
       
    //     let official_converted_to_vec = official_utxo_included_in_specific_utxos
    //     .iter()
    //     .map(|utxo| utxo.outpoint)
    //     .collect::<Vec<_>>();

    //     let coin_selection = CustomCoinSelection { specific_utxos: official_converted_to_vec };

    //     let mut tx_builder = wallet.build_tx().coin_selection(coin_selection);

    //     let fee_rate = FeeRate::from_sat_per_vb(fee);

    //     tx_builder.fee_rate(fee_rate);
        
    //     //  // The Coldcard requires an output redeem witness script
    //     tx_builder.include_output_redeem_witness_script();

    //     // // Enable signaling replace-by-fee
    //     tx_builder.enable_rbf();

    //     // // Add our script and the amount in sats to send
    //     tx_builder.add_recipient(dest_script, amount);


    //     let (mut psbt, details) = tx_builder.finish()?;

    //     let serialized_psbt = BdkWallet::serialize_psbt(&psbt)?;

    //     Ok(serialized_psbt)
    // }


  

   
}
