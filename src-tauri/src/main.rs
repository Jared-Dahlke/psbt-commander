// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app_wallet;
use app_wallet::{AppWallet, CreatePsbtInput};
use crate::app_wallet::WalletInfo;



fn get_network(network_type: &str) -> bdk_wallet::bitcoin::Network {
    match network_type {
        "bitcoin" => bdk_wallet::bitcoin::Network::Bitcoin,
        "regtest" => bdk_wallet::bitcoin::Network::Regtest,
        "signet" => bdk_wallet::bitcoin::Network::Signet,
        "testnet" => bdk_wallet::bitcoin::Network::Testnet,
        _ => panic!("Invalid network type"),
    }
}

#[tauri::command]
fn test_connection(url: String) -> bool {
    AppWallet::is_valid_electrum_url(&url)
}

#[tauri::command]
fn get_info_by_descriptor(descriptor: &str, changedescriptor: &str, url: &str, networktype: &str) -> Result<WalletInfo, String> {
    
    let network = get_network(networktype);
    println!("Network: {:?}", network);
    match AppWallet::get_info_by_descriptor(descriptor, changedescriptor, url, network) {
        Ok(wallet_info) => {
            println!("Wallet get_info_by_descriptor success");
            Ok(wallet_info)
        },
        Err(e) => {
            eprintln!("Error get_info_by_descriptor: {}", e);
            Err(e.to_string())
        },
    }
}

#[tauri::command]
fn create_psbt(descriptor: &str, change_descriptor: &str, amount: u64, recipient: &str, utxo_txids: Vec<&str>, fee: u64, url: &str, networktype: &str) -> Result<String, String> {

    let network = get_network(networktype);
    
    let input = CreatePsbtInput {
        descriptor,
        change_descriptor,
        amount,  // Amount in satoshis
        recipient,
        utxo_txids,
        fee,
        url,
        network
    };
    match AppWallet::create_psbt(input) {
        Ok(psbt) => {
            println!("Wallet create_psbt success");
            Ok(psbt)
        },
        Err(e) => {
            eprintln!("Error create_psbt: {}", e);
            Err(e.to_string())
        },
    }
}

#[tauri::command]
fn broadcast_psbt(descriptor: &str, changedescriptor: &str, url: &str, networktype: &str, psbt: &str) -> Result<String, String> {
    let network = get_network(networktype);
    println!("t Network: {:?}", network);
    println!("t Descriptor: {:?}", descriptor);
    println!("t Change Descriptor: {:?}", changedescriptor);
    println!("t Url: {:?}", url);
    println!("t Psbt: {:?}", psbt);
    match AppWallet::broadcast_psbt(descriptor, changedescriptor, url, network, psbt) {
        Ok(txid) => {
            println!("Wallet broadcast_psbt success");
            Ok(txid)
        },
        Err(e) => {
            eprintln!("Error broadcast_psbt: {}", e);
            Err(e.to_string())
        },
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_info_by_descriptor, create_psbt, broadcast_psbt,test_connection])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
