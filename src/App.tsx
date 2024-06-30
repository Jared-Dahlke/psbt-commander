import {
	Send,
	SendIcon,
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

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from '@/components/ui/tooltip'

import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from './lib/utils'
import path from 'path'

export function App() {
	const pathname = useLocation().pathname
	const isSend = pathname.includes('send')

	const getClasses = (path: string) => {
		const isActive = pathname === path
		return cn(
			'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all md:h-8 md:w-8',
			isActive
				? 'rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base'
				: 'hover:text-foreground'
		)
	}

	return (
		<div className='flex min-h-screen w-full flex-col bg-muted/40'>
			<aside className='fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex'>
				<nav className='flex flex-col items-center gap-4 px-2 sm:py-5'>
					{/* <a
						href='#'
						className='group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base'>
						<Package2 className='h-4 w-4 transition-all group-hover:scale-110' />
						<span className='sr-only'>Acme Inc</span>
					</a> */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Link to='/' className={getClasses('/')}>
								<Home className='h-5 w-5' />
								<span className='sr-only'>Dashboard</span>
							</Link>
						</TooltipTrigger>
						<TooltipContent side='right'>Dashboard</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link to='/send' className={getClasses('/send')}>
								<SendIcon className='h-5 w-5 transition-all group-hover:scale-110' />
								<span className='sr-only'>Send</span>
							</Link>
						</TooltipTrigger>
						<TooltipContent side='right'>Send</TooltipContent>
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
								<a
									href='send'
									className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'>
									<SendIcon className='h-5 w-5' />
									Send
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

					<div className='flex'>
						<div>
							<h1 className='text-4xl font-extrabold mt-5'>UTXO Commander</h1>
							<CardDescription className='text-lg mt-1'>
								A Rust BDK powered UTXO Manager
							</CardDescription>
						</div>
					</div>
				</header>
				<main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
					<Outlet />
				</main>
			</div>
		</div>
	)
}
