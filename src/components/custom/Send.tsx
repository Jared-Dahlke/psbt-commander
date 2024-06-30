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

const formSchema = z.object({
	toAddress: z.string(),
	amount: z.number()
})

export const Send = () => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema)
	})

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values)
	}

	return (
		<div>
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
								name='toAddress'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Amount in Satoshis</FormLabel>
										<FormControl>
											<Input placeholder='Enter amount here...' {...field} />
										</FormControl>
										<FormDescription>
											The amount of satoshis to send.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* <p className='text-red-300 font-bold'>
								Balance: {info.confirmed_balance}
							</p>
							<p>New Address: {info.new_address}</p>
							<p>Utxos: {JSON.stringify(info.utxos)}</p> */}
						</CardContent>
						<CardFooter>
							<Button type='submit'>Submit</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	)
}
