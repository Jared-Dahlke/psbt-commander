// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// mod wallet;
mod bdk_wallet;
// use bdk::{Wallet, SyncOptions};
// use bdk::database::MemoryDatabase;
// use bdk::blockchain::ElectrumBlockchain;
// use bdk::electrum_client::Client;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// #[tauri::command]
// fn create_wallet() -> String {
//     let wallet = wallet::Wallet::new();
//     wallet.get_address().to_string()
// }

// fn create_wallet_bdk() -> Result<(), bdk::Error> {
//     let client = Client::new("ssl://electrum.blockstream.info:60002")?;
//     let blockchain = ElectrumBlockchain::from(client);
//     let wallet = Wallet::new(
//         "wpkh([c258d2e4/84h/1h/0h]tpubDDYkZojQFQjht8Tm4jsS3iuEmKjTiEGjG6KnuFNKKJb5A6ZUCUZKdvLdSDWofKi4ToRCwb9poe1XdqfUnP4jaJjCB2Zwv11ZLgSbnZSNecE/0/*)",
//         Some("wpkh([c258d2e4/84h/1h/0h]tpubDDYkZojQFQjht8Tm4jsS3iuEmKjTiEGjG6KnuFNKKJb5A6ZUCUZKdvLdSDWofKi4ToRCwb9poe1XdqfUnP4jaJjCB2Zwv11ZLgSbnZSNecE/1/*)"),
//         bdk::bitcoin::Network::Testnet,
//         MemoryDatabase::default(),
//     )?;

//     wallet.sync(&blockchain, SyncOptions::default())?;

//     println!("Descriptor balance: {} SAT", wallet.get_balance()?);

//     Ok(())
// }

#[tauri::command]
fn create_wallet() {
    
    match bdk_wallet::BdkWallet::create_wallet_bdk() {
        Ok(_) => println!("Wallet created successfully"),
        Err(e) => eprintln!("Error creating wallet: {}", e),
    }
    

}

#[tauri::command]
fn create_desc() {
    
   
    match bdk_wallet::BdkWallet::create_descriptor() {
        Ok(_) => println!("Wallet desc successfully"),
        Err(e) => eprintln!("Error desc wallet: {}", e),
    }

}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, create_wallet, create_desc])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
