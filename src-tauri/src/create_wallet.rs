use bdk::wallet::Wallet;
use bdk::database::MemoryDatabase;
use bdk::blockchain::noop::NoopBlockchain;
use bdk::keys::bip39::{Mnemonic, Language};
use bdk::keys::{GeneratableKey, ExtendedKey, DescriptorKey};

pub fn create_new_wallet() -> Wallet<MemoryDatabase> {
    // Generate a new mnemonic
    let mnemonic = Mnemonic::generate_in(Language::English, 12).unwrap();
    println!("Mnemonic: {}", mnemonic);

    // Convert mnemonic to an extended key
    let xkey: ExtendedKey = mnemonic.into_extended_key().unwrap();

    // Create a descriptor key from the extended key
    let descriptor_key = DescriptorKey::from_extended_key(&xkey, bdk::keys::SecpCtx::new())
        .unwrap()
        .into_key();

    // Create a wallet descriptor
    let descriptor = format!("wpkh({})", descriptor_key);

    // Create a new wallet instance
    Wallet::new(
        &descriptor,
        None,
        bdk::bitcoin::Network::Testnet,
        MemoryDatabase::default(),
        NoopBlockchain,
    ).unwrap();

    // console log the new wallet
    println!("Wallet: {:?}", wallet);
}
