use bdk::wallet::AddressIndex;
use bdk::{Wallet, SyncOptions, miniscript, KeychainKind};
use bdk::database::MemoryDatabase;
use bdk::blockchain::ElectrumBlockchain;
use bdk::electrum_client::Client;
use bdk::keys::{DerivableKey, GeneratableKey, GeneratedKey, ExtendedKey, bip39::{Mnemonic, WordCount, Language}};

use bdk::template::Bip84;
//use bdk::keys::bip39::{Mnemonic, Language};
pub struct BdkWallet {
   
}

impl BdkWallet {
    pub fn create_wallet_bdk() -> Result<(), bdk::Error> {
        // let client = Client::new("ssl://electrum.blockstream.info:60002")?;
        let client = Client::new("tcp://localhost:50000")?;
        let blockchain = ElectrumBlockchain::from(client);
        let wallet = Wallet::new(
            "wpkh([3f519d7d/84'/1'/0']tpubDCtvJVccjoDD4Ef4Z1tAsgjX4NA969N5sczc8dwwcVHGmTDhHqUXtA6zQFWHHY9bZDvfWS1X4PkSBv22yzAjPbsUUKJqs5QTCniQkKvxh2h/0/*)#s625str5",
            Some("wpkh([3f519d7d/84'/1'/0']tpubDCtvJVccjoDD4Ef4Z1tAsgjX4NA969N5sczc8dwwcVHGmTDhHqUXtA6zQFWHHY9bZDvfWS1X4PkSBv22yzAjPbsUUKJqs5QTCniQkKvxh2h/1/*)#pw04d7nv"),
            bdk::bitcoin::Network::Regtest,         
            MemoryDatabase::default(),
        )?;
    
        wallet.sync(&blockchain, SyncOptions::default())?;

        let info = wallet.get_address(AddressIndex::New)?;
        
        // print info
        println!("Address: {}", info);

        let balance = wallet.get_balance()?;
        println!("Balance: {}", balance);
    
    
        Ok(())
        
    }



    pub fn create_descriptor() -> Result<(), bdk::Error> {
        // let client = Client::new("ssl://electrum.blockstream.info:60002")?;
        let network =  bdk::bitcoin::Network::Regtest; // Or this can be Network::Bitcoin, Network::Signet or Network::Regtest

        // Generate fresh mnemonic
        let mnemonic: GeneratedKey<_, miniscript::Segwitv0> = Mnemonic::generate((WordCount::Words12, Language::English)).unwrap();
        // Convert mnemonic to string
        let mnemonic_words = mnemonic.to_string();
        // Parse a mnemonic
        let mnemonic  = Mnemonic::parse(&mnemonic_words).unwrap();
        // Generate the extended key
        let xkey: ExtendedKey = mnemonic.into_extended_key().unwrap();
        // Get xprv from the extended key
        let xprv = xkey.into_xprv(network).unwrap();
    
        // Create a BDK wallet structure using BIP 84 descriptor ("m/84h/1h/0h/0" and "m/84h/1h/0h/1")
        let wallet = Wallet::new(
            Bip84(xprv, KeychainKind::External),
            Some(Bip84(xprv, KeychainKind::Internal)),
            network,
            MemoryDatabase::default(),
        )
        .unwrap();
    
        println!("mnemonic: {}\n\nrecv desc (pub key): {:#?}\n\nchng desc (pub key): {:#?}",
            mnemonic_words,
            wallet.get_descriptor_for_keychain(KeychainKind::External).to_string(),
            wallet.get_descriptor_for_keychain(KeychainKind::Internal).to_string());
    
    
        Ok(())
        
    }

  
}
