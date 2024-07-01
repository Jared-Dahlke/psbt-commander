use std::str::FromStr;

use bdk::bitcoin::consensus::serialize;

use bdk::bitcoin::psbt::PartiallySignedTransaction;
use bdk::bitcoin::{OutPoint, Script, Weight};
use bdk::wallet::coin_selection::{decide_change, CoinSelectionAlgorithm, CoinSelectionResult};
use bdk::wallet::AddressIndex;
use bdk::{blockchain, miniscript, FeeRate, KeychainKind, SyncOptions, Wallet, WeightedUtxo};
use bdk::database::{Database, MemoryDatabase};
use bdk::blockchain::{Blockchain, ElectrumBlockchain};
use bdk::electrum_client::Client;
use bdk::keys::{DerivableKey, GeneratableKey, GeneratedKey, ExtendedKey, bip39::{Mnemonic, WordCount, Language}};
use bdk::template::Bip84;

use serde::Serialize;


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
}

#[derive(Debug)]
pub struct CustomCoinSelection {
    specific_utxos: Vec<OutPoint>,
}

impl<D: Database> CoinSelectionAlgorithm<D> for CustomCoinSelection {
    fn coin_select(
        &self,
        database: &D,
        required_utxos: Vec<WeightedUtxo>,
        optional_utxos: Vec<WeightedUtxo>,
        fee_rate: bdk::FeeRate,
        target_amount: u64,
        drain_script: &Script,
    ) -> Result<CoinSelectionResult, bdk::Error> {
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
                    **selected_amount += weighted_utxo.utxo.txout().value;
                    **additional_weight += Weight::from_wu(
                        (TXIN_BASE_WEIGHT + weighted_utxo.satisfaction_weight) as u64,
                    );
                    Some(weighted_utxo.utxo)
                },
            )
            .collect::<Vec<_>>();

        let additional_fees = fee_rate.fee_wu(additional_weight);
        let amount_needed_with_fees = additional_fees + target_amount;

        if selected_amount < amount_needed_with_fees {
            return Err(bdk::Error::InsufficientFunds {
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


   pub fn serialize_psbt(psbt: &PartiallySignedTransaction) -> Result<String, bdk::Error> {
        let raw_psbt = psbt.serialize();
        Ok(base64::encode(&raw_psbt))
    }

    pub fn create_psbt(
        CreatePsbtInput {
            descriptor,
            change_descriptor,
            amount,
            recipient,
            utxo_txids,
            fee,
        }: CreatePsbtInput,
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
            Ok(script) => script.payload.script_pubkey(),
            Err(_) => return Err(bdk::Error::Generic("Invalid address".to_string())),
        };

     

        let official_utxos = wallet.list_unspent()?;

        let official_utxo_included_in_specific_utxos = official_utxos
    .iter()
    .filter(|utxo| utxo_txids.contains(&utxo.outpoint.txid.to_string().as_str()))
    .collect::<Vec<_>>();

  
       
        let official_converted_to_vec = official_utxo_included_in_specific_utxos
        .iter()
        .map(|utxo| utxo.outpoint)
        .collect::<Vec<_>>();

        let coin_selection = CustomCoinSelection { specific_utxos: official_converted_to_vec };

        let mut tx_builder = wallet.build_tx().coin_selection(coin_selection);

        let fee_rate = FeeRate::from_sat_per_vb(fee);

        tx_builder.fee_rate(fee_rate);
        
        //  // The Coldcard requires an output redeem witness script
        tx_builder.include_output_redeem_witness_script();

        // // Enable signaling replace-by-fee
        tx_builder.enable_rbf();

        // // Add our script and the amount in sats to send
        tx_builder.add_recipient(dest_script, amount);


        let (mut psbt, details) = tx_builder.finish()?;

        let serialized_psbt = BdkWallet::serialize_psbt(&psbt)?;

         println!("psbt details:{:#?}", details);
         println!("serialized_psbt: {}", serialized_psbt);

        Ok(serialized_psbt)
    }


    pub fn create_new_wallet() -> Result<(), bdk::Error> {
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
