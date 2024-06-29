use bitcoin::bip32::{ChildNumber, ExtendendPrivKey};
use bitcoin::key::Secp256k1;
use bitcoin::{Address, Network};

use bitcoin::util::bip39::{Mnemonic, Language};

pub struct Wallet {
    mnemonic: Mnemonic,
    xpriv: ExtendendPrivKey,
}

impl Wallet {
    pub fn new() -> Self {
        // Generate a new mnemonic
        let mnemonic = Mnemonic::new(Mnemonic::Words12, Language::English);
        // Derive the master private key
        let xpriv = ExtendedPrivKey::new_master(Network::Bitcoin, &mnemonic.to_seed("")).unwrap();

        Wallet { mnemonic, xpriv }
    }

    pub fn get_address(&self) -> Address {
        // Derive the first child key
        let child_xpriv = self.xpriv.derive_priv(&Secp256k1::new(), &vec![ChildNumber::from(0)]).unwrap();
        // Get the public key and convert it to an address
        let pubkey = child_xpriv.private_key.public_key(&Secp256k1::new());
        Address::p2pkh(&pubkey, Network::Bitcoin)
    }
}
