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
