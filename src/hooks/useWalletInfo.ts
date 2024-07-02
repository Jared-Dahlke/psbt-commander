import { useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/tauri'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'

export const UtxoSchema = z.object({
	txid: z.string(),
	value: z.number()
})

export type Utxo = z.infer<typeof UtxoSchema>

export const WalletInfoSchema = z.object({
	confirmed_balance: z.number(),
	new_address: z.string(),
	utxos: z.array(UtxoSchema)
})

export type WalletInfo = z.infer<typeof WalletInfoSchema>

export const useWalletInfo = () => {
	const { clientUrl, network, descriptor, changeDescriptor } = useLocalStorage()
	const walletInfoQuery = useQuery({
		queryKey: ['wallet_info', descriptor, changeDescriptor, clientUrl, network],
		queryFn: async () => {
			console.log('calling function')
			const res = await invoke('get_info_by_descriptor', {
				descriptor,
				changedescriptor: changeDescriptor,
				url: clientUrl,
				networktype: network
			})
			console.log('res', res)
			return WalletInfoSchema.parse(res)
		},
		enabled: !!descriptor && !!changeDescriptor
	})

	return walletInfoQuery
}
