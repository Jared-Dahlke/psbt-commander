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
		<div className='flex min-h-screen w-full flex-col bg-muted/40'>
			<aside className='fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex'>
				<nav className='flex flex-col items-center gap-4 px-2 sm:py-5'>
					<a
						href='#'
						className='group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base'>
						<Package2 className='h-4 w-4 transition-all group-hover:scale-110' />
						<span className='sr-only'>Acme Inc</span>
					</a>
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href='#'
								className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'>
								<Home className='h-5 w-5' />
								<span className='sr-only'>Dashboard</span>
							</a>
						</TooltipTrigger>
						<TooltipContent side='right'>Dashboard</TooltipContent>
					</Tooltip>

					{/* <Tooltip>
						<TooltipTrigger asChild>
							<a
								href='#'
								className='flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8'>
								<ShoppingCart className='h-5 w-5' />
								<span className='sr-only'>Orders</span>
							</a>
						</TooltipTrigger>
						<TooltipContent side='right'>Orders</TooltipContent>
					</Tooltip> */}
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href='#'
								className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'>
								<Package className='h-5 w-5' />
								<span className='sr-only'>Products</span>
							</a>
						</TooltipTrigger>
						<TooltipContent side='right'>Products</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href='#'
								className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'>
								<Users2 className='h-5 w-5' />
								<span className='sr-only'>Customers</span>
							</a>
						</TooltipTrigger>
						<TooltipContent side='right'>Customers</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href='#'
								className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'>
								<LineChart className='h-5 w-5' />
								<span className='sr-only'>Analytics</span>
							</a>
						</TooltipTrigger>
						<TooltipContent side='right'>Analytics</TooltipContent>
					</Tooltip>
				</nav>
				<nav className='mt-auto flex flex-col items-center gap-4 px-2 sm:py-5'>
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href='#'
								className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'>
								<Settings className='h-5 w-5' />
								<span className='sr-only'>Settings</span>
							</a>
						</TooltipTrigger>
						<TooltipContent side='right'>Settings</TooltipContent>
					</Tooltip>
				</nav>
			</aside>
			<div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
				<header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
					<Sheet>
						<SheetTrigger asChild>
							<Button size='icon' variant='outline' className='sm:hidden'>
								<PanelLeft className='h-5 w-5' />
								<span className='sr-only'>Toggle Menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side='left' className='sm:max-w-xs'>
							<nav className='grid gap-6 text-lg font-medium'>
								<a
									href='#'
									className='group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base'>
									<Package2 className='h-5 w-5 transition-all group-hover:scale-110' />
									<span className='sr-only'>Acme Inc</span>
								</a>
								<a
									href='#'
									className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'>
									<Home className='h-5 w-5' />
									Dashboard
								</a>
								{/* <a
									href='#'
									className='flex items-center gap-4 px-2.5 text-foreground'>
									<ShoppingCart className='h-5 w-5' />
									Orders
								</a> */}
								<a
									href='#'
									className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'>
									<Package className='h-5 w-5' />
									Products
								</a>
								<a
									href='#'
									className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'>
									<Users2 className='h-5 w-5' />
									Customers
								</a>
								<a
									href='#'
									className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'>
									<LineChart className='h-5 w-5' />
									Settings
								</a>
							</nav>
						</SheetContent>
					</Sheet>
					{/* <Breadcrumb className='hidden md:flex'>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<a href='#'>Dashboard</a>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<a href='#'>Orders</a>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Recent Orders</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb> */}

					{/* <div className='relative ml-auto flex-1 md:grow-0'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							type='search'
							placeholder='Search...'
							className='w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]'
						/>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='outline'
								size='icon'
								className='overflow-hidden rounded-full'>
								<img
									src='/placeholder-user.jpg'
									width={36}
									height={36}
									alt='Avatar'
									className='overflow-hidden rounded-full'
								/>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Settings</DropdownMenuItem>
							<DropdownMenuItem>Support</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Logout</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu> */}
					{/* <svg
						width='200'
						height='200'
						viewBox='0 0 200 200'
						xmlns='http://www.w3.org/2000/svg'>
						<rect
							x='10'
							y='10'
							width='180'
							height='180'
							fill='#1E1E2F'
							rx='20'
						/>
						<circle cx='60' cy='60' r='20' fill='#F9C74F' />
						<circle cx='60' cy='100' r='20' fill='#F9C74F' />
						<circle cx='60' cy='140' r='20' fill='#F9C74F' />
						<rect x='90' y='50' width='80' height='20' fill='#43AA8B' rx='5' />
						<rect x='90' y='90' width='80' height='20' fill='#43AA8B' rx='5' />
						<rect x='90' y='130' width='80' height='20' fill='#43AA8B' rx='5' />
						<text
							x='50%'
							y='180'
							text-anchor='middle'
							font-size='18'
							fill='#FFF'>
							UTXO MANAGER
						</text>
					</svg> */}
					<div className='flex'>
						<div>
							<h1 className='text-4xl font-extrabold mt-5'>UTXO Commander</h1>
							<CardDescription className='text-lg mt-1'>
								A Rust BDK powered UTXO Manager
							</CardDescription>
						</div>
						{/* <svg
							width='120'
							height='120'
							viewBox='0 0 120 120'
							xmlns='http://www.w3.org/2000/svg'>
							<circle cx='60' cy='60' r='50' fill='#1E1E2F' />
							<polygon
								points='60,20 70,50 100,50 75,70 85,100 60,80 35,100 45,70 20,50 50,50'
								fill='#F9C74F'
							/>
							
						</svg> */}
					</div>
				</header>
				<main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
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
											<DropdownMenuCheckboxItem>
												Declined
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem>
												Refunded
											</DropdownMenuCheckboxItem>
										</DropdownMenuContent>
									</DropdownMenu>
									<Button
										size='sm'
										variant='outline'
										className='h-7 gap-1 text-sm'>
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
					{/* <div>
						<Card className='overflow-hidden' x-chunk='dashboard-05-chunk-4'>
							<CardHeader className='flex flex-row items-start bg-muted/50'>
								<div className='grid gap-0.5'>
									<CardTitle className='group flex items-center gap-2 text-lg'>
										Order Oe31b70H
										<Button
											size='icon'
											variant='outline'
											className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'>
											<Copy className='h-3 w-3' />
											<span className='sr-only'>Copy Order ID</span>
										</Button>
									</CardTitle>
									<CardDescription>Date: November 23, 2023</CardDescription>
								</div>
								<div className='ml-auto flex items-center gap-1'>
									<Button size='sm' variant='outline' className='h-8 gap-1'>
										<Truck className='h-3.5 w-3.5' />
										<span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
											Track Order
										</span>
									</Button>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button size='icon' variant='outline' className='h-8 w-8'>
												<MoreVertical className='h-3.5 w-3.5' />
												<span className='sr-only'>More</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem>Edit</DropdownMenuItem>
											<DropdownMenuItem>Export</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem>Trash</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent className='p-6 text-sm'>
								<div className='grid gap-3'>
									<div className='font-semibold'>Order Details</div>
									<ul className='grid gap-3'>
										<li className='flex items-center justify-between'>
											<span className='text-muted-foreground'>
												Glimmer Lamps x <span>2</span>
											</span>
											<span>$250.00</span>
										</li>
										<li className='flex items-center justify-between'>
											<span className='text-muted-foreground'>
												Aqua Filters x <span>1</span>
											</span>
											<span>$49.00</span>
										</li>
									</ul>
									<Separator className='my-2' />
									<ul className='grid gap-3'>
										<li className='flex items-center justify-between'>
											<span className='text-muted-foreground'>Subtotal</span>
											<span>$299.00</span>
										</li>
										<li className='flex items-center justify-between'>
											<span className='text-muted-foreground'>Shipping</span>
											<span>$5.00</span>
										</li>
										<li className='flex items-center justify-between'>
											<span className='text-muted-foreground'>Tax</span>
											<span>$25.00</span>
										</li>
										<li className='flex items-center justify-between font-semibold'>
											<span className='text-muted-foreground'>Total</span>
											<span>$329.00</span>
										</li>
									</ul>
								</div>
								<Separator className='my-4' />
								<div className='grid grid-cols-2 gap-4'>
									<div className='grid gap-3'>
										<div className='font-semibold'>Shipping Information</div>
										<address className='grid gap-0.5 not-italic text-muted-foreground'>
											<span>Liam Johnson</span>
											<span>1234 Main St.</span>
											<span>Anytown, CA 12345</span>
										</address>
									</div>
									<div className='grid auto-rows-max gap-3'>
										<div className='font-semibold'>Billing Information</div>
										<div className='text-muted-foreground'>
											Same as shipping address
										</div>
									</div>
								</div>
								<Separator className='my-4' />
								<div className='grid gap-3'>
									<div className='font-semibold'>Customer Information</div>
									<dl className='grid gap-3'>
										<div className='flex items-center justify-between'>
											<dt className='text-muted-foreground'>Customer</dt>
											<dd>Liam Johnson</dd>
										</div>
										<div className='flex items-center justify-between'>
											<dt className='text-muted-foreground'>Email</dt>
											<dd>
												<a href='mailto:'>liam@acme.com</a>
											</dd>
										</div>
										<div className='flex items-center justify-between'>
											<dt className='text-muted-foreground'>Phone</dt>
											<dd>
												<a href='tel:'>+1 234 567 890</a>
											</dd>
										</div>
									</dl>
								</div>
								<Separator className='my-4' />
								<div className='grid gap-3'>
									<div className='font-semibold'>Payment Information</div>
									<dl className='grid gap-3'>
										<div className='flex items-center justify-between'>
											<dt className='flex items-center gap-1 text-muted-foreground'>
												<CreditCard className='h-4 w-4' />
												Visa
											</dt>
											<dd>**** **** **** 4532</dd>
										</div>
									</dl>
								</div>
							</CardContent>
							<CardFooter className='flex flex-row items-center border-t bg-muted/50 px-6 py-3'>
								<div className='text-xs text-muted-foreground'>
									Updated <time dateTime='2023-11-23'>November 23, 2023</time>
								</div>
								<Pagination className='ml-auto mr-0 w-auto'>
									<PaginationContent>
										<PaginationItem>
											<Button size='icon' variant='outline' className='h-6 w-6'>
												<ChevronLeft className='h-3.5 w-3.5' />
												<span className='sr-only'>Previous Order</span>
											</Button>
										</PaginationItem>
										<PaginationItem>
											<Button size='icon' variant='outline' className='h-6 w-6'>
												<ChevronRight className='h-3.5 w-3.5' />
												<span className='sr-only'>Next Order</span>
											</Button>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							</CardFooter>
						</Card>
					</div> */}
				</main>
			</div>
		</div>
	)
}
