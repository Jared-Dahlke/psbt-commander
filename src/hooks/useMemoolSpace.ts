import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const fetchFeeRates = async () => {
	try {
		const response = await fetch(
			'https://mempool.space/api/v1/fees/recommended'
		)
		if (!response.ok) {
			throw new Error('Network response was not ok')
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.error('Failed to fetch fee rates:', error)
		return null
	}
}

export const FeeRatesSchema = z.object({
	economyFee: z.number(),
	fastestFee: z.number(),
	halfHourFee: z.number(),
	hourFee: z.number(),
	minimumFee: z.number()
})

export const useMemoolSpace = () => {
	const feeRatesQuery = useQuery({
		queryKey: ['fetchFeeRates'],
		queryFn: async () => {
			const res = await fetchFeeRates()
			return FeeRatesSchema.parse(res)
		},
		refetchInterval: 60000
	})
	return feeRatesQuery
}
