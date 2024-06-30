import {
	Bitcoin,
	ChevronLeft,
	ChevronRight,
	Copy,
	CreditCard,
	DollarSign,
	File,
	Home,
	LineChart,
	ListFilter,
	MoreVertical,
	Package,
	Package2,
	PanelLeft,
	Search,
	Settings,
	ShoppingCart,
	Truck,
	Users2
} from 'lucide-react'
import numeral from 'numeral'
import { Badge } from '@/components/ui/badge'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
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
	Pagination,
	PaginationContent,
	PaginationItem
} from '@/components/ui/pagination'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip'
import { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import SatoshiIcon from '/satoshi.svg'

export function Dashboard() {
	const [descriptor, setDescriptor] = useState(
		`wpkh([3f519d7d/84'/1'/0']tpubDCtvJVccjoDD4Ef4Z1tAsgjX4NA969N5sczc8dwwcVHGmTDhHqUXtA6zQFWHHY9bZDvfWS1X4PkSBv22yzAjPbsUUKJqs5QTCniQkKvxh2h/0/*)#s625str5`
	)
	const [info, setInfo] = useState({})
	async function get_info_by_descriptor() {
		const res = (await invoke('get_info_by_descriptor', {
			descriptor
		})) as unknown as any[]
		console.log('res', res)

		setInfo(res)
	}

	return (
		<>
			<Card className='sm:col-span-2' x-chunk='dashboard-05-chunk-0'>
				<CardHeader className='pb-3'>
					<CardTitle>Your Descriptor</CardTitle>
					{/* <CardDescription className='max-w-lg text-balance leading-relaxed'>
										Introducing Our Dynamic Orders Dashboard for Seamless
										Management and Insightful Analysis.
									</CardDescription> */}
				</CardHeader>
				<CardContent>
					<Input
						onChange={(e) => setDescriptor(e.currentTarget.value)}
						value={descriptor}
						placeholder='Please enter descriptor...'
						className='w-full'
					/>

					{/* <p className='text-red-300 font-bold'>
								Balance: {info.confirmed_balance}
							</p>
							<p>New Address: {info.new_address}</p>
							<p>Utxos: {JSON.stringify(info.utxos)}</p> */}
				</CardContent>
				<CardFooter>
					<Button onClick={get_info_by_descriptor}>Get Wallet Info</Button>
				</CardFooter>
			</Card>
			<div className='grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Card x-chunk='dashboard-01-chunk-0'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Balance</CardTitle>
							<img src={SatoshiIcon} />
							{/* <Bitcoin className='h-4 w-4 text-muted-foreground' /> */}
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
							{/* <img src={SatoshiIcon} /> */}
							{/* <Bitcoin className='h-4 w-4 text-muted-foreground' /> */}
						</CardHeader>
						<CardContent>
							<div className=' font-bold'>{info.new_address}</div>
							{/* <p className='text-xs text-muted-foreground'>Satoshis</p> */}
						</CardContent>
					</Card>

					{/* <Card x-chunk='dashboard-05-chunk-1'>
								<CardHeader className='pb-2'>
									<CardDescription>This Week</CardDescription>
									<CardTitle className='text-4xl'>$1,329</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='text-xs text-muted-foreground'>
										+25% from last week
									</div>
								</CardContent>
								<CardFooter>
									<Progress value={25} aria-label='25% increase' />
								</CardFooter>
							</Card>
							<Card x-chunk='dashboard-05-chunk-2'>
								<CardHeader className='pb-2'>
									<CardDescription>This Month</CardDescription>
									<CardTitle className='text-4xl'>$5,329</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='text-xs text-muted-foreground'>
										+10% from last month
									</div>
								</CardContent>
								<CardFooter>
									<Progress value={12} aria-label='12% increase' />
								</CardFooter>
							</Card> */}
				</div>
				<Tabs defaultValue='week'>
					<div className='flex items-center'>
						{/* <TabsList>
									<TabsTrigger value='week'>Week</TabsTrigger>
									<TabsTrigger value='month'>Month</TabsTrigger>
									<TabsTrigger value='year'>Year</TabsTrigger>
								</TabsList> */}
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
											{/* <TableHead className='hidden sm:table-cell'>
														Type
													</TableHead>
													<TableHead className='hidden sm:table-cell'>
														Status
													</TableHead>
													<TableHead className='hidden md:table-cell'>
														Date
													</TableHead> */}
											<TableHead className='text-right'>Amount</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{info.utxos?.map((utxo) => (
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
		</>
	)
}
