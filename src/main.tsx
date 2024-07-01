import React from 'react'
import ReactDOM from 'react-dom/client'
import './input.css'
import { TooltipProvider } from './components/ui/tooltip'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { Dashboard } from './components/custom/Dashboard'
import { App } from './App'
import { Send } from './components/custom/Send'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { Settings } from './components/custom/Settings'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

const router = createMemoryRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '/',
				element: <Dashboard />
			},
			{
				path: '/send',
				element: <Send />
			},
			{
				path: '/settings',
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
