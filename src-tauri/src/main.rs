// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod bdk_wallet;
use bdk_wallet::CreatePsbtInput;

use crate::bdk_wallet::WalletInfo;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_info_by_descriptor(descriptor: &str) -> Result<WalletInfo, String> {
    match bdk_wallet::BdkWallet::get_info_by_descriptor(descriptor) {
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
fn create_psbt(descriptor: &str, amount: u64, recipient: &str) -> Result<String, String> {

    let input = CreatePsbtInput {
        descriptor,
        amount,  // Amount in satoshis
        recipient
    };
    match bdk_wallet::BdkWallet::create_psbt(input) {
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
fn create_desc() {
    
   
    match bdk_wallet::BdkWallet::create_descriptor() {
        Ok(_) => println!("Wallet desc successfully"),
        Err(e) => eprintln!("Error desc wallet: {}", e),
    }

}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, get_info_by_descriptor, create_desc, create_psbt])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
