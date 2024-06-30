import { useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/tauri'
import { z } from 'zod'

export const WalletInfoSchema = z.object({
	confirmed_balance: z.number(),
	new_address: z.string(),
	utxos: z.array(
		z.object({
			txid: z.string(),
			value: z.number()
		})
	)
})

export type WalletInfo = z.infer<typeof WalletInfoSchema>

interface IProps {
	descriptor: string | undefined
	changeDescriptor: string | undefined
}
export const useWalletInfo = ({ descriptor, changeDescriptor }: IProps) => {
	const walletInfoQuery = useQuery({
		queryKey: ['wallet_info', descriptor, changeDescriptor],
		queryFn: async () => {
			const res = await invoke('get_info_by_descriptor', {
				descriptor,
				change_descriptor: changeDescriptor
			})
			return WalletInfoSchema.parse(res)
		},
		enabled: !!descriptor && !!changeDescriptor
	})

	return walletInfoQuery
}
