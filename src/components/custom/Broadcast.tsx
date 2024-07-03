import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Button } from '../ui/button'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { invoke } from '@tauri-apps/api/tauri'
import { Textarea } from '../ui/textarea'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const formSchema = z.object({
	psbt: z.string()
})

// async function broadcastPsbt(psbtBase64: string) {
// 	try {
// 		// Decode the PSBT from base64 string to hex string
// 		const psbtBuffer = Buffer.from(psbtBase64, 'base64')
// 		const psbtHex = psbtBuffer.toString('hex')

// 		// Broadcast the raw transaction using mempool.space API
// 		const response = await fetch('https://mempool.space/api/tx/push', {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'text/plain'
// 			},
// 			body: psbtHex
// 		})

// 		if (response.ok) {
// 			return {success: true}
// 		} else {
// 			const errorText = await response.text()
// 			throw new Error(`Failed to broadcast transaction: ${errorText}`)
// 		}
// 	} catch (error) {
// 		if (error instanceof Error) {
// 			console.error('Error broadcasting PSBT:', error.message)
// 			throw new Error(`Error broadcasting PSBT: ${error.message}`)
// 		}
// 	}
// }

export const Broadcast = () => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			psbt: ''
		}
	})

	const { changeDescriptor, descriptor, clientUrl, network } = useLocalStorage()

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const res = await invoke('broadcast_psbt', {
			psbt: values.psbt,
			descriptor,
			clientUrl,
			network
		})

		console.log(res)
	}

	return (
		<div className='space-y-8'>
			{/* <div className='grid gap-4 sm:grid-cols-2'>
				<Card x-chunk='dashboard-01-chunk-0'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Balance</CardTitle>
						<img src={SatoshiIcon} />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{numeral(info?.confirmed_balance).format('0,0')}
						</div>
						<p className='text-xs text-muted-foreground'>Satoshis</p>
					</CardContent>
				</Card>

				<Card x-chunk='dashboard-01-chunk-0'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Next unused Address
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className=' font-bold'>{info?.new_address}</div>
					</CardContent>
				</Card>
			</div> */}

			{/* {info && JSON.stringify(form)} */}

			<p className='text-orange-500 text-2xl'>
				This feature is currently not implemented yet.
			</p>
			<Card className='sm:col-span-2' x-chunk='dashboard-05-chunk-0'>
				<CardHeader className='pb-3'>
					<CardTitle>Broadcast PSBT</CardTitle>
					<CardDescription className='max-w-lg text-balance leading-relaxed'>
						Broadcast your signed PSBT.
					</CardDescription>
				</CardHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent>
							<FormField
								control={form.control}
								name='psbt'
								render={({ field }) => (
									<FormItem className='w-full'>
										{/* <FormLabel>Fee</FormLabel> */}
										<FormControl>
											<Textarea
												disabled
												className='w-full'
												placeholder='Enter PSBT here...'
												{...field}
												onChange={(e) =>
													form.setValue('psbt', e.target.value, {
														shouldValidate: true
													})
												}
												rows={10}
											/>
										</FormControl>
										{/* <FormDescription>Sats/vb</FormDescription> */}
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
						<CardFooter>
							<Button disabled type='submit'>
								Submit
							</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	)
}
