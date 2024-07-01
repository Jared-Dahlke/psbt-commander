import { File, ListFilter } from 'lucide-react'
import numeral from 'numeral'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { Tabs, TabsContent } from '@/components/ui/tabs'

import SatoshiIcon from '/satoshi.svg'
import { useWalletInfo } from '@/hooks/useWalletInfo'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { FormItem } from '../ui/form'
import { Label } from '../ui/label'

export function Dashboard() {
	const { changeDescriptor, setChangeDescriptor, descriptor, setDescriptor } =
		useLocalStorage()

	const walletInfoQuery = useWalletInfo({ descriptor, changeDescriptor })
	const { data: info } = walletInfoQuery

	return (
		<>
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
			</Card>
			<div className='grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2'>
				<div className='grid gap-4 sm:grid-cols-2'>
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
				</div>
				<Tabs defaultValue='week'>
					<div className='flex items-center'>
						<div className='ml-auto flex items-center gap-2'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='outline'
										size='sm'
										className='h-7 gap-1 text-sm'>
										<ListFilter className='h-3.5 w-3.5' />
										<span className='sr-only sm:not-sr-only'>Filter</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									<DropdownMenuLabel>Filter by</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuCheckboxItem checked>
										Fulfilled
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>Declined</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>Refunded</DropdownMenuCheckboxItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button size='sm' variant='outline' className='h-7 gap-1 text-sm'>
								<File className='h-3.5 w-3.5' />
								<span className='sr-only sm:not-sr-only'>Export</span>
							</Button>
						</div>
					</div>
					<TabsContent value='week'>
						<Card x-chunk='dashboard-05-chunk-3'>
							<CardHeader className='px-7'>
								<CardTitle>UTXOs</CardTitle>
								<CardDescription>
									A list of all the UTXOs in your wallet
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>TXID</TableHead>

											<TableHead className='text-right'>Amount</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{info?.utxos?.map((utxo) => (
											<TableRow className='bg-accent'>
												<TableCell>
													<div className='font-medium'>{utxo.txid}</div>
												</TableCell>

												<TableCell className='text-right'>
													{numeral(utxo.value).format('0,0')}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
			{/* <Button onClick={() => invoke('create_desc')}>Create new wallet</Button> */}
		</>
	)
}
