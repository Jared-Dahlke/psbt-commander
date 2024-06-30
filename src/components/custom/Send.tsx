import {
	Card,
	CardContent,
	CardDescription,
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
import { UtxoTable } from '../utxo-table/utxo-table'
import { useDescriptors } from '@/hooks/useLocalStorage'
import { useWalletInfo } from '@/hooks/useWalletInfo'
import { DataTable } from '../utxo-table/components/data-table'
import { columns } from '../utxo-table/components/columns'
import {
	isPermissionGranted,
	requestPermission,
	sendNotification
} from '@tauri-apps/api/notification'

import { AlertCircle, File } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs'

async function downloadTextFile(content: string) {
	const fileName = 'psbt.txt'

	try {
		await writeTextFile(fileName, content, { dir: BaseDirectory.Download })
		console.log('File downloaded successfully!')

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
	utxoTxids: z.array(z.string()).min(1)
})

export const Send = () => {
	const [psbt, setPsbt] = useState('')
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			toAddress: 'bcrt1qr2pwrdg54mavec3fy6trmtuj45f6nncaxn0z7w',
			amount: 123455
		}
	})

	const { changeDescriptor, setChangeDescriptor, descriptor, setDescriptor } =
		useDescriptors()

	const walletInfoQuery = useWalletInfo({ descriptor, changeDescriptor })
	const { data: info } = walletInfoQuery

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values)

		setPsbt('')

		// clear root error
		form.clearErrors('root')

		const input = {
			descriptor,
			changeDescriptor,
			amount: values.amount,
			recipient: values.toAddress,
			utxoTxids: values.utxoTxids
			// utxoTxids: [
			// 	'026f4a09f73eced919209f2879e9be7d4e2455d3a5821d991f9557d17dc33d15'
			// ]
		}

		try {
			const res = (await invoke('create_psbt', input)) as unknown as any[]
			console.log('res', res)
			setPsbt(res)
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

	const rowSelectionVal = form.watch('utxoTxids')
	console.log('rowSelectionVal', rowSelectionVal)

	const values = form.getValues()

	return (
		<div>
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
							<FormField
								control={form.control}
								name='amount'
								render={({ field }) => (
									<FormItem>
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
							<div>
								<FormItem>
									<FormLabel>UTXOs</FormLabel>
									<FormDescription>
										Select the UTXOs you would like to include in the PSBT.
									</FormDescription>
									<DataTable
										handleUpdateRowSelection={(rowSelection) => {
											console.log('rowSelection', rowSelection)
											const selectedTxids = Object.keys(rowSelection).map(
												(index) => {
													return info?.utxos[parseInt(index)].txid
												}
											)

											console.log(' about to set form value', selectedTxids)

											form.setValue('utxoTxids', selectedTxids)
										}}
										data={info?.utxos || []}
										columns={columns}
									/>

									{form.formState.errors.utxoTxids && (
										<FormMessage>
											{form.formState.errors.utxoTxids.message}
										</FormMessage>
									)}
								</FormItem>
							</div>
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
									<Button
										onClick={() => downloadTextFile(psbt)}
										size='sm'
										variant='outline'
										className='h-7 gap-1 text-sm'>
										<File className='h-3.5 w-3.5' />
										<span className='sr-only sm:not-sr-only'>Export</span>
									</Button>
									<Textarea value={psbt} disabled rows={7} />
								</div>
							)}
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	)
}
