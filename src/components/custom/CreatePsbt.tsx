import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Input } from '../ui/input'
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
import { useState } from 'react'
import { Textarea } from '../ui/textarea'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useWalletInfo } from '@/hooks/useWalletInfo'
import { DataTable } from '../utxo-table/components/data-table'
import { columns } from '../utxo-table/components/columns'
import {
	isPermissionGranted,
	requestPermission,
	sendNotification
} from '@tauri-apps/api/notification'

import { AlertCircle, Download } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs'
import { toast } from 'sonner'
import { CopyComponent } from './copy-component'
import { FeeAlert } from './fee-alert'

async function downloadTextFile(content: string) {
	const fileName = 'psbt.txt'

	try {
		await writeTextFile(fileName, content, { dir: BaseDirectory.Download })
		console.log('File downloaded successfully!')

		toast.success(`File ${fileName} has been saved to your Downloads folder.`)
		let permissionGranted = await isPermissionGranted()
		if (!permissionGranted) {
			const permission = await requestPermission()
			permissionGranted = permission === 'granted'
		}
		if (permissionGranted) {
			sendNotification({
				title: 'Download Successful',
				body: `File ${fileName} has been saved to your Downloads folder.`
			})
		}
	} catch (error) {
		console.error('Error downloading file:', error)
	}
}

const formSchema = z.object({
	toAddress: z.string(),
	amount: z.number().min(1),
	utxoTxids: z.array(z.string()).min(1, 'Please select at least one UTXO'),
	fee: z.number().min(1)
})

export const CreatePsbt = () => {
	const [psbt, setPsbt] = useState<string>('')
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema)
	})

	const { changeDescriptor, descriptor, clientUrl, network } = useLocalStorage()

	const walletInfoQuery = useWalletInfo()
	const { data: info } = walletInfoQuery

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setPsbt('')

		// clear root error
		form.clearErrors('root')

		const input = {
			descriptor,
			changeDescriptor,
			amount: values.amount,
			recipient: values.toAddress,
			utxoTxids: values.utxoTxids,
			fee: values.fee,
			url: clientUrl,
			networktype: network
		}

		try {
			const res = await invoke('create_psbt', input)
			const parsedRes = z.string().parse(res)
			setPsbt(parsedRes)
			toast.success('PSBT created successfully!')
		} catch (e) {
			// if (e instanceof string) {
			// 	console.error('invoke error message is instnace:', e)
			// }
			form.setError('root', {
				type: 'manual',
				message: e as unknown as string
			})
			console.error('invoke error result:', e)
		}
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
			<Card className='sm:col-span-2' x-chunk='dashboard-05-chunk-0'>
				<CardHeader className='pb-3'>
					<CardTitle>Create PSBT</CardTitle>
					{/* <CardDescription className='max-w-lg text-balance leading-relaxed'>
										Introducing Our Dynamic Orders Dashboard for Seamless
										Management and Insightful Analysis.
									</CardDescription> */}
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className='space-y-8'>
							<FormField
								control={form.control}
								name='toAddress'
								render={({ field }) => (
									<FormItem>
										<FormLabel>To Address</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter to address here...'
												{...field}
												onChange={(e) =>
													form.setValue('toAddress', e.target.value, {
														shouldValidate: true
													})
												}
											/>
										</FormControl>
										<FormDescription>
											The address you are sending bitcoin to.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className='flex gap-8 w-full items-center relative'>
								<FormField
									control={form.control}
									name='amount'
									render={({ field }) => (
										<FormItem className='w-1/3'>
											<FormLabel>Amount in Satoshis</FormLabel>
											<FormControl>
												<Input
													type='number'
													placeholder='Enter amount here...'
													{...field}
													onChange={(e) =>
														form.setValue('amount', Number(e.target.value), {
															shouldValidate: true
														})
													}
												/>
											</FormControl>
											<FormDescription>
												The amount of satoshis to send.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='fee'
									render={({ field }) => (
										<FormItem className='w-1/6'>
											<FormLabel>Fee</FormLabel>
											<FormControl>
												<Input
													type='number'
													placeholder='Enter fee rate...'
													{...field}
													onChange={(e) =>
														form.setValue('fee', Number(e.target.value), {
															shouldValidate: true
														})
													}
												/>
											</FormControl>
											<FormDescription>Sats/vb</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FeeAlert />
							</div>

							<FormItem>
								<FormLabel>UTXOs</FormLabel>

								<DataTable
									handleUpdateRowSelection={(rowSelection) => {
										console.log('rowSelection', rowSelection)
										const selectedTxids = Object.keys(rowSelection).map(
											(index) => {
												return info?.utxos[parseInt(index)].txid
											}
										)

										const selectionRes = z
											.array(z.string())
											.parse(selectedTxids)

										form.setValue('utxoTxids', selectionRes)
									}}
									data={info?.utxos || []}
									columns={columns}
								/>
								<FormDescription>
									Select the UTXOs you would like to include in the PSBT.
								</FormDescription>
								{form.formState.errors.utxoTxids && (
									<FormMessage>
										{form.formState.errors.utxoTxids.message}
									</FormMessage>
								)}
							</FormItem>
						</CardContent>
						<CardFooter className='flex flex-col gap-5 items-start'>
							{form.formState.errors.root && (
								<Alert variant='destructive'>
									<AlertCircle className='h-4 w-4' />
									<AlertTitle>Unable to create PSBT</AlertTitle>
									<AlertDescription>
										{form.formState.errors.root.message}
									</AlertDescription>
								</Alert>
							)}
							<Button type='submit'>Submit</Button>

							{psbt && (
								<div className='flex flex-col gap-1 w-full items-end'>
									<div className='flex gap-3'>
										<Button
											onClick={(e) => {
												e.preventDefault()
												downloadTextFile(psbt)
											}}
											size='sm'
											variant='outline'
											className='h-7 gap-1 text-sm'>
											<Download className='h-3.5 w-3.5' />
											<span className='sr-only sm:not-sr-only'>Download</span>
										</Button>
										<CopyComponent textToCopy={psbt} />
									</div>
									<Textarea value={psbt} disabled rows={3} />
								</div>
							)}
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	)
}
