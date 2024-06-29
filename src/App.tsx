import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { invoke } from '@tauri-apps/api/tauri'
import { Testing } from './components/Testing'
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
		<div className='container'>
			{/* <h1>Welcome to Tauri!</h1> */}

			{/* <div className='row'>
				<a href='https://vitejs.dev' target='_blank'>
					<img src='/vite.svg' className='logo vite' alt='Vite logo' />
				</a>
				<a href='https://tauri.app' target='_blank'>
					<img src='/tauri.svg' className='logo tauri' alt='Tauri logo' />
				</a>
				<a href='https://reactjs.org' target='_blank'>
					<img src={reactLogo} className='logo react' alt='React logo' />
				</a>
			</div> */}

			{/* <p>Click on the Tauri, Vite, and React logos to learn more.</p> */}
			<Testing />
			<form
				className='row'
				onSubmit={(e) => {
					e.preventDefault()
					get_info_by_descriptor()
				}}>
				<input
					id='greet-input'
					onChange={(e) => setDescriptor(e.currentTarget.value)}
					value={descriptor}
					placeholder='Please enter descriptor...'
				/>
				<button type='submit'>Get info</button>
			</form>

			<p className='text-red-300 font-bold'>
				Balance: {info.confirmed_balance}
			</p>
			<p>New Address: {info.new_address}</p>
			<p>Utxos: {JSON.stringify(info.utxos)}</p>

			{/* <p>{greetMsg}</p> */}
		</div>
	)
}

export default App
