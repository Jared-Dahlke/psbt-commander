use std::str::FromStr;

use bdk::bitcoin::consensus::serialize;

use bdk::wallet::coin_selection::DefaultCoinSelectionAlgorithm;
use bdk::wallet::AddressIndex;
use bdk::{blockchain, miniscript, KeychainKind, SignOptions, SyncOptions, Wallet};
use bdk::database::MemoryDatabase;
use bdk::blockchain::{Blockchain, ElectrumBlockchain};
use bdk::electrum_client::Client;
use bdk::keys::{DerivableKey, GeneratableKey, GeneratedKey, ExtendedKey, bip39::{Mnemonic, WordCount, Language}};
use bdk::template::Bip84;

use serde::Serialize;




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
    pub recipient: &'a str

}





pub struct BdkWallet {
   
}

impl BdkWallet {
    
    fn create_wallet(
        descriptor: &str,
        change_descriptor: Option<&str>
    ) -> Result<Wallet<MemoryDatabase>, bdk::Error>{
        // let client = Client::new("ssl://electrum.blockstream.info:60002")?;
        let client = Client::new("tcp://localhost:50000")?;
        let blockchain = ElectrumBlockchain::from(client);
        let wallet: Wallet<MemoryDatabase> = Wallet::new(
            descriptor,
            change_descriptor,
            bdk::bitcoin::Network::Regtest,         
            MemoryDatabase::default(),
        )?;
    
        wallet.sync(&blockchain, SyncOptions::default())?;
    
        Ok(wallet)
    }


    pub fn sign_psbt_with_mnemonic(
        mnemonic: &str,
        mut psbt: &mut bdk::bitcoin::util::psbt::PartiallySignedTransaction,
    ) -> Result<Wallet<MemoryDatabase>, bdk::Error>{
        // let client = Client::new("ssl://electrum.blockstream.info:60002")?;

        let client = Client::new("tcp://localhost:50000")?;
        let blockchain = ElectrumBlockchain::from(client);
       

       // Parse a mnemonic
       let mnemonic  = Mnemonic::parse(mnemonic).unwrap();
       // Generate the extended key
       let xkey: ExtendedKey = mnemonic.into_extended_key().unwrap();
       // Get xprv from the extended key
       let xprv = xkey.into_xprv(bdk::bitcoin::Network::Regtest).unwrap();


        let wallet = Wallet::new(
            Bip84(xprv, KeychainKind::External),
            Some(Bip84(xprv, KeychainKind::Internal)),
            bdk::bitcoin::Network::Regtest,
            MemoryDatabase::default(),
        )
        .unwrap();
    
        wallet.sync(&blockchain, SyncOptions::default())?;      

       let sign_result = wallet.sign(&mut psbt, SignOptions::default())?;
        
        println!("sign_result: {:#?}", sign_result);

        let _psbt_is_finalized = wallet.finalize_psbt(&mut psbt, SignOptions::default())?;

        println!("psbt_is_finalized: {:#?}", _psbt_is_finalized);

        let tx = psbt.clone().extract_tx();

        // Broadcast the transaction using our chosen backend, returning a `Txid` or an error
       
        let txid =  blockchain.broadcast(&tx)?;
       //  println!("broadcasted txid: {:#?}", txid);

        
    
        Ok(wallet)
    }

  

    pub fn get_info_by_descriptor(
        descriptor: &str,
        change_descriptor: Option<&str>
    ) -> Result<WalletInfo, bdk::Error> {
        
        let wallet = BdkWallet::create_wallet(descriptor, change_descriptor)?;
        let address_info = wallet.get_address(AddressIndex::New)?;
        let new_address = address_info.to_string();

        let balance = wallet.get_balance()?;

        let confirmed_balance = balance.confirmed;

        let utxos = wallet.list_unspent()?;
        let utxos_with_txid_and_value = utxos.iter().map(|utxo| UtxoInfo {
            txid: utxo.outpoint.txid.to_string(),
            value: utxo.txout.value,
        }).collect();
    
        Ok(WalletInfo {
            confirmed_balance,
            new_address,
            utxos: utxos_with_txid_and_value,
        })
    }




    pub fn create_psbt(
        CreatePsbtInput { descriptor, change_descriptor, amount, recipient }: CreatePsbtInput
    ) -> Result<String, bdk::Error> {
        let client = Client::new("tcp://localhost:50000")?;
        let blockchain = ElectrumBlockchain::from(client);
        let wallet = Wallet::new(
            descriptor,
            change_descriptor,
            bdk::bitcoin::Network::Regtest,         
            MemoryDatabase::default(),
        )?;
    
        wallet.sync(&blockchain, SyncOptions::default())?;
    
        
        let dest_script = bdk::bitcoin::Address::from_str(recipient); // .script_pubkey();
        let dest_script = match dest_script {
            Ok(script) => script.script_pubkey(),
            Err(_) => return Err(bdk::Error::Generic("Invalid address".to_string())),
        };

        let mut tx_builder = wallet.build_tx().coin_selection(DefaultCoinSelectionAlgorithm::default());

        //  // The Coldcard requires an output redeem witness script
        tx_builder.include_output_redeem_witness_script();

        // // Enable signaling replace-by-fee
        tx_builder.enable_rbf();

        // // Add our script and the amount in sats to send
        tx_builder.add_recipient(dest_script, amount);

        // "Finish" the builder which returns a tuple:
        // A `PartiallySignedTransaction` which serializes as a psbt
        // And `TransactionDetails` which has helpful info about the transaction we just built
         let (mut psbt, details) = tx_builder.finish()?;

        //let res = BdkWallet::sign_psbt_with_mnemonic("small knife minute present alarm squirrel humor shoulder cricket moral snow traffic", &mut psbt)?;
       

         let serialized_psbt = base64::encode(&serialize(&psbt));
         println!("{:#?}", details);
         println!("{}", serialized_psbt);

        Ok(serialized_psbt)
    }

    // pub fn create_psbt_and_broadcast(
    //     CreatePsbtInput { descriptor, amount, recipient }: CreatePsbtInput
    // ){
    //     let wallet = BdkWallet::create_wallet(descriptor)?;
        
    //     let dest_script = bdk::bitcoin::Address::from_str(recipient); // .script_pubkey();
    //     let dest_script = match dest_script {
    //         Ok(script) => script.script_pubkey(),
    //         Err(_) => return Err(bdk::Error::Generic("Invalid address".to_string())),
    //     };

    //     let mut tx_builder = wallet.build_tx().coin_selection(DefaultCoinSelectionAlgorithm::default());

    //     //  // The Coldcard requires an output redeem witness script
    //     tx_builder.include_output_redeem_witness_script();

    //     // // Enable signaling replace-by-fee
    //     tx_builder.enable_rbf();

    //     // // Add our script and the amount in sats to send
    //     tx_builder.add_recipient(dest_script, amount);

    //     // "Finish" the builder which returns a tuple:
    //     // A `PartiallySignedTransaction` which serializes as a psbt
    //     // And `TransactionDetails` which has helpful info about the transaction we just built
    //      let (mut psbt, details) = tx_builder.finish()?;

    //      // temporary, going to go ahead and sign and broadcast here:
    //     let signed = wallet.sign(&mut psbt, SignOptions::default())?;
    //     let tx = psbt.extract_tx();

    //     // Broadcast the transaction using our chosen backend, returning a `Txid` or an error
    //     let client = Client::new("tcp://localhost:50000")?;
    //     let blockchain = ElectrumBlockchain::from(client);
    //     let txid = blockchain.broadcast(&tx)?;
  
    //     println!("{:#?}", txid);
    //      /////

    //     //  let serialized_psbt =  base64::encode(&serialize(&psbt));
    //     //let serialized_psbt =  base64::encode(&serialize(&psbt));

    //     // println!("{:#?}", details);
    //     // println!("{}", serialized_psbt);

    //  //   Ok()
    // }


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
    
    
        // print the recovery words:
        println!("Recovery words: {}", mnemonic_words);
        Ok(())
        
    }

   
}
