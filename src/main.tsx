import React from 'react'
import ReactDOM from 'react-dom/client'
import './input.css'
import { TooltipProvider } from './components/ui/tooltip'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { Dashboard } from './components/custom/Dashboard'
import { App } from './App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { Settings } from './components/custom/Settings'
import { CreatePsbt } from './components/custom/CreatePsbt'
import { paths } from './constants'
import { Broadcast } from './components/custom/Broadcast'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

const router = createMemoryRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: paths.DASHBOARD,
				element: <Dashboard />
			},
			{
				path: paths.CREATE_PSBT,
				element: <CreatePsbt />
			},
			{
				path: paths.BROADCAST,
				element: <Broadcast />
			},
			{
				path: paths.SETTINGS,
				element: <Settings />
			}
		]
	}
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<TooltipProvider>
			<QueryClientProvider client={queryClient}>
				<Toaster position='top-right' />
				<RouterProvider router={router} />
				{/* <ReactQueryDevtools initialIsOpen={false} /> */}
			</QueryClientProvider>
		</TooltipProvider>
	</React.StrictMode>
)
