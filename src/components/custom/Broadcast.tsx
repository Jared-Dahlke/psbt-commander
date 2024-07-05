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
	FormField,
	FormItem,
	FormMessage
} from '@/components/ui/form'
import { invoke } from '@tauri-apps/api/tauri'
import { Textarea } from '../ui/textarea'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { toast } from 'sonner'

const formSchema = z.object({
	psbt: z.string()
})

export const Broadcast = () => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			psbt: ''
		}
	})

	const { changeDescriptor, descriptor, clientUrl, network } = useLocalStorage()

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			await invoke('broadcast_psbt', {
				psbt: values.psbt,
				descriptor,
				changedescriptor: changeDescriptor,
				url: clientUrl,
				networktype: network
			})
			toast.success('PSBT broadcasted successfully')
		} catch (error) {
			toast.error('Error broadcasting PSBT')
		}
	}

	return (
		<div className='space-y-8'>
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
							<Button type='submit'>Submit</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	)
}
