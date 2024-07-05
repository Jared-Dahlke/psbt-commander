const DB_MAGIC: &str = "bdk_wallet_electrum_example";
const SEND_AMOUNT: Amount = Amount::from_sat(5000);
const STOP_GAP: usize = 50;
const BATCH_SIZE: usize = 5;

use std::{path::PathBuf, str::FromStr};
use anyhow::anyhow;
use tauri::api::path::data_dir;
use std::io::Write;


use ::bdk_wallet::{bitcoin::{FeeRate, Network, OutPoint, Script, Weight}, wallet::coin_selection::{decide_change, CoinSelectionAlgorithm, CoinSelectionResult}, Wallet, WeightedUtxo};
use serde::Serialize;
use bdk_wallet::{bitcoin::{ hex::FromHex, Psbt, TxIn}, wallet::coin_selection::Error::InsufficientFunds};
use bdk_electrum::electrum_client;
use bdk_electrum::BdkElectrumClient;
use bdk_file_store::Store;
use bdk_wallet::bitcoin::{Address, Amount};
use bdk_wallet::chain::collections::HashSet;
use bdk_wallet::{KeychainKind, SignOptions};
use bdk_wallet::bitcoin::base64::Engine;
use bdk_wallet::bitcoin::base64::prelude::BASE64_STANDARD;


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
    pub change_descriptor: &'a str,
    pub amount: u64,
    pub recipient: &'a str,
    pub utxo_txids: Vec<&'a str>,
    pub fee: u64,
    pub url: &'a str,
    pub network: Network
}

#[derive(Debug)]


pub struct CustomCoinSelection {
    specific_utxos: Vec<OutPoint>,
}

impl CoinSelectionAlgorithm for CustomCoinSelection {
    fn coin_select(
        &self,       
        required_utxos: Vec<WeightedUtxo>,
        optional_utxos: Vec<WeightedUtxo>,
        fee_rate: FeeRate,
        target_amount: u64,
        drain_script: &Script,
    ) -> Result<CoinSelectionResult, bdk_wallet::wallet::coin_selection::Error> {
        println!("fee_rate: {:#?}", fee_rate);
        let mut selected_amount = 0;
        let mut additional_weight = Weight::ZERO;

        // Filter UTXOs based on specified OutPoints
        let selected_utxos = required_utxos
             .into_iter()
             .chain(optional_utxos)
             .filter(|weighted_utxo| self.specific_utxos.contains(&weighted_utxo.utxo.outpoint()))
             .scan(
                 (&mut selected_amount, &mut additional_weight),
                 |(selected_amount, additional_weight), weighted_utxo| {
                     **selected_amount += weighted_utxo.utxo.txout().value.to_sat();
                     **additional_weight += TxIn::default()
                         .segwit_weight()
                         .checked_add(bdk_wallet::bitcoin::Weight::from_wu_usize(weighted_utxo.satisfaction_weight))
                         .expect("`Weight` addition should not cause an integer overflow");
                     Some(weighted_utxo.utxo)
                 },
             )
             .collect::<Vec<_>>();

             let additional_fees = (fee_rate * additional_weight).to_sat();


        let amount_needed_with_fees = additional_fees + target_amount;

        if selected_amount < amount_needed_with_fees {
            return Err(InsufficientFunds{
                needed: amount_needed_with_fees,
                available: selected_amount,
            });
        }

        let remaining_amount = selected_amount - amount_needed_with_fees;
        let excess = decide_change(remaining_amount, fee_rate, drain_script);


        Ok(CoinSelectionResult {
            selected: selected_utxos,
            fee_amount: additional_fees,
            excess,
        })
    }
}



pub struct AppWallet {
   
}

impl AppWallet {
    




    pub fn get_info_by_descriptor(
        descriptor: &str,
        change_descriptor: &str,
        url: &str,
        network: Network
    ) -> Result<WalletInfo, anyhow::Error> {
        better_panic::Settings::debug()
        .most_recent_first(false)
        .lineno_suffix(true)
        .install();

      
    let app_data_path: PathBuf = data_dir().ok_or_else(|| anyhow::anyhow!("Failed to get app data directory"))?
    .join("bdk-electrum");

        let mut db =
            Store::<bdk_wallet::wallet::ChangeSet>::open_or_create_new(DB_MAGIC.as_bytes(), app_data_path)?;
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
        println!("Wallet balance after syncing: {} sats", balance);
    
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
            value: utxo.txout.value.to_sat()
        }).collect();
    
        Ok(WalletInfo {
            confirmed_balance: balance.confirmed.to_sat(),
            new_address: address.address.to_string(),
            utxos: utxos_with_txid_and_value,
        })
    }


   
    pub fn broadcast_psbt(
        descriptor: &str,
        change_descriptor: &str,
        url: &str,
        network: Network,
        psbt: &str,
    ) -> Result<String, anyhow::Error> {
        
        println!("Broadcasting PSBT");

        // log all inputs
        println!("descriptor: {:#?}", descriptor);
        println!("change_descriptor: {:#?}", change_descriptor);
        println!("url: {:#?}", url);
        println!("psbt: {:#?}", psbt);
        println!("network: {:#?}", network);

        
        let app_data_path: PathBuf = data_dir().ok_or_else(|| anyhow::anyhow!("Failed to get app data directory"))?
    .join("bdk-electrum");

        let mut db =
            Store::<bdk_wallet::wallet::ChangeSet>::open_or_create_new(DB_MAGIC.as_bytes(), app_data_path)?;
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
        
        if let Some(changeset) = wallet.take_staged() {
            db.append_changeset(&changeset)?;
        }
    
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

        println!("raw psbt: {:#?}", psbt.to_string());

        let psbt = Vec::from_hex(&psbt)?;
    
       
      // let psbt = BASE64_STANDARD.decode(&psbt).unwrap();
       let mut psbt = Psbt::deserialize(&psbt).unwrap();

       let _psbt_is_final = bdk_wallet::wallet::Wallet::finalize_psbt(&mut wallet, &mut psbt, SignOptions::default())?;

       println!("final PSBT: {:#?}", psbt);

  
       let tx = psbt.extract_tx()?;



       println!("Tx extracted from PSBT: {:#?}", tx);
  
       client.transaction_broadcast(&tx)?;
  
       println!("Tx broadcasted! Txid: {}", tx.compute_txid());
  
        Ok(tx.compute_txid().to_string())

    }


    pub fn create_psbt(
        CreatePsbtInput {
            descriptor,
            change_descriptor,
            amount,
            recipient,
            utxo_txids,
            fee,
            url,
            network
        }: CreatePsbtInput
    ) -> Result<String, anyhow::Error> {
        
        
        let app_data_path: PathBuf = data_dir().ok_or_else(|| anyhow::anyhow!("Failed to get app data directory"))?
    .join("bdk-electrum");

        let mut db =
            Store::<bdk_wallet::wallet::ChangeSet>::open_or_create_new(DB_MAGIC.as_bytes(), app_data_path)?;
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
        
        if let Some(changeset) = wallet.take_staged() {
            db.append_changeset(&changeset)?;
        }
    
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
    
   


        let official_utxos = wallet.list_unspent();

        let official_utxo_included_in_specific_utxos = official_utxos
    .filter(|utxo| utxo_txids.contains(&utxo.outpoint.txid.to_string().as_str()))
    .collect::<Vec<_>>();

  
       
        let official_converted_to_vec = official_utxo_included_in_specific_utxos
        .iter()
        .map(|utxo| utxo.outpoint)
        .collect::<Vec<_>>();

        let coin_selection = CustomCoinSelection { specific_utxos: official_converted_to_vec };

        let mut tx_builder = wallet.build_tx().coin_selection(coin_selection);

        let fee_rate = FeeRate::from_sat_per_vb(fee).unwrap();

        tx_builder.fee_rate(fee_rate);
        
        //  // The Coldcard requires an output redeem witness script
       // tx_builder.include_output_redeem_witness_script();

        // // Enable signaling replace-by-fee
        tx_builder.enable_rbf();

        let to_address = Address::from_str(recipient)?
        .require_network(network)?;

        let final_amount = Amount::from_sat(amount);


        tx_builder
        .add_recipient(to_address.script_pubkey(), final_amount);

        let psbt = tx_builder.finish()?;

        let serialized_psbt = psbt.serialize_hex();

        Ok(serialized_psbt)
    }

   
}
