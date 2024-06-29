import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { invoke } from '@tauri-apps/api/tauri'
import { Testing } from './components/Testing'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Dashboard } from './components/custom/Dashboard'
//import './App.css'

function App() {
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
		<div className='w-screen h-screen'>
			<Dashboard />
		</div>
	)
}

export default App
