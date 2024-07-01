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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import useFormPersist from 'react-hook-form-persist'
import { useTestConnection } from '@/hooks/useTestConnection'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Label } from '../ui/label'

const formSchema = z.object({
	clientUrl: z.string(),
	network: z.string()
})

const networks = [
	{
		label: 'Regtest',
		value: 'regtest'
	},
	// {
	// 	label: 'Bitcoin',
	// 	value: 'bitcoin'
	// },
	{
		label: 'Testnet',
		value: 'testnet'
	},
	{
		label: 'Signet',
		value: 'signet'
	}
]

export const Settings = () => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema)
	})
	useFormPersist('settings', {
		watch: form.watch,
		setValue: form.setValue,
		storage: window.localStorage
	})

	const { status } = useTestConnection({
		url: form.watch('clientUrl')
	})

	console.log('network', form.watch('network'))

	return (
		<div className='space-y-8'>
			{/* {info && JSON.stringify(form)} */}
			<Card className='sm:col-span-2' x-chunk='dashboard-05-chunk-0'>
				<CardHeader className='pb-3'>
					<CardTitle>Settings</CardTitle>
					{/* <CardDescription className='max-w-lg text-balance leading-relaxed'>
										Introducing Our Dynamic Orders Dashboard for Seamless
										Management and Insightful Analysis.
									</CardDescription> */}
				</CardHeader>
				<Form {...form}>
					<form>
						<CardContent className='space-y-8'>
							<FormField
								control={form.control}
								name='clientUrl'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Electrum Server</FormLabel>
										<FormControl>
											<Input
												placeholder='tcp://localhost:50000'
												{...field}
												onChange={(e) =>
													form.setValue('clientUrl', e.target.value, {
														shouldValidate: true
													})
												}
											/>
										</FormControl>
										<FormDescription>
											The URL to your Electrum Server.
										</FormDescription>
										<FormMessage />
										{status === 'Connected' ? (
											<div className='flex gap-2 items-center'>
												<Label>Connection is good!</Label>
												<div className='rounded-full bg-green-500 h-3 w-3' />
											</div>
										) : (
											<div className='flex gap-2 items-center'>
												<Label>Not Connected</Label>
												<div className='rounded-full bg-red-500 h-3 w-3' />
											</div>
										)}
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='network'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Network</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select a Network' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{networks.map(({ label, value }) => (
													<SelectItem key={value} value={value}>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>
											The network to connect to.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
						<CardFooter className='flex flex-col gap-5 items-start'>
							{/* {form.formState.errors.root && (
								<Alert variant='destructive'>
									<AlertCircle className='h-4 w-4' />
									<AlertTitle>Unable to create PSBT</AlertTitle>
									<AlertDescription>
										{form.formState.errors.root.message}
									</AlertDescription>
								</Alert>
							)} */}
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	)
}
