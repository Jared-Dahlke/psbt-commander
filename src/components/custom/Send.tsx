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

const formSchema = z.object({
	toAddress: z.string(),
	amount: z.string()
})

export const Send = () => {
	const [psbt, setPsbt] = useState('')
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema)
	})

	const { changeDescriptor, setChangeDescriptor, descriptor, setDescriptor } =
		useDescriptors()

	const walletInfoQuery = useWalletInfo({ descriptor, changeDescriptor })
	console.log('walletInfoQuery', walletInfoQuery)
	const { data: info } = walletInfoQuery

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values)

		const input = {
			descriptor,
			change_descriptor: changeDescriptor,
			amount: Number(values.amount),
			recipient: values.toAddress
		}

		const res = (await invoke('create_psbt', input)) as unknown as any[]
		console.log('res', res)
		setPsbt(res)
	}

	return (
		<div>
			{info && JSON.stringify(info)}
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
											/>
										</FormControl>
										<FormDescription>
											The amount of satoshis to send.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DataTable data={info?.utxos || []} columns={columns} />
						</CardContent>
						<CardFooter className='flex flex-col gap-5 items-start'>
							<Button type='submit'>Submit</Button>

							<Textarea value={psbt} disabled rows={7} />
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	)
}
