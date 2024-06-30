import React from 'react'
import ReactDOM from 'react-dom/client'
import './input.css'
import { TooltipProvider } from './components/ui/tooltip'
import {
	createBrowserRouter,
	RouterProvider,
	createHashRouter,
	createMemoryRouter
} from 'react-router-dom'
import { Dashboard } from './components/custom/Dashboard'
import { App } from './App'
import { Send } from './components/custom/Send'

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
			}
		]
	}
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<TooltipProvider>
			<RouterProvider router={router} />
		</TooltipProvider>
	</React.StrictMode>
)
