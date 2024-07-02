import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Input } from '../ui/input'
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
import { useWalletInfo } from '@/hooks/useWalletInfo'

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
	const { changeDescriptor, setChangeDescriptor, descriptor, setDescriptor } =
		useLocalStorage()

	const wallet = useWalletInfo()

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

	return (
		<div className='space-y-8'>
			<Card className='sm:col-span-2'>
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
							<div>
								{status === 'Connected' ? (
									<div className='flex gap-2 items-center'>
										<div className='rounded-full bg-green-500 h-3 w-3' />
										<Label>Successfully Connected!</Label>
									</div>
								) : (
									<div className='flex gap-2 items-center'>
										<div className='rounded-full bg-red-500 h-3 w-3' />
										<Label>Not Connected</Label>
									</div>
								)}
							</div>
						</CardFooter>
					</form>
				</Form>
			</Card>
			<Card className='sm:col-span-2' x-chunk='dashboard-05-chunk-0'>
				<CardHeader className='pb-3'>
					<CardTitle>Your Descriptor</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<FormItem>
						<Label>Descriptor</Label>
						<Input
							onChange={(e) => setDescriptor(e.currentTarget.value)}
							value={descriptor}
							placeholder='Please enter descriptor...'
							className='w-full'
						/>
					</FormItem>
					<FormItem>
						<Label>Change Descriptor</Label>
						<Input
							onChange={(e) => setChangeDescriptor(e.currentTarget.value)}
							value={changeDescriptor}
							placeholder='Please enter change descriptor...'
							className='w-full'
						/>
					</FormItem>
				</CardContent>
				<CardFooter>
					{!!wallet?.data?.new_address ? (
						<div className='flex gap-2 items-center'>
							<div className='rounded-full bg-green-500 h-3 w-3' />
							<Label>Successfully found wallet!</Label>
						</div>
					) : (
						<div className='flex gap-2 items-center'>
							<div className='rounded-full bg-red-500 h-3 w-3' />
							<Label>No wallet found</Label>
						</div>
					)}
				</CardFooter>
			</Card>
		</div>
	)
}
