import { Info, Terminal } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useMemoolSpace } from '@/hooks/useMemoolSpace'

export function FeeAlert() {
	const { data: feeRates } = useMemoolSpace()

	return (
		<Alert variant={'info'} className='max-w-xs'>
			<Info className='h-4 w-4' />
			<AlertTitle>Current Fees from mempool.space</AlertTitle>
			<AlertDescription>
				Minimum: {feeRates?.minimumFee} - Economy: {feeRates?.economyFee} -
				Fastest: {feeRates?.fastestFee}
			</AlertDescription>
		</Alert>
	)
}
