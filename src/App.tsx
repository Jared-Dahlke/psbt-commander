import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { invoke } from '@tauri-apps/api/tauri'
import './App.css'

function App() {
	async function createWallet() {
		// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
		const res = await invoke('create_wallet')
		console.log('res', res)
	}
	async function createDesc() {
		// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
		const res = await invoke('create_desc')
		console.log('res', res)
	}

	return (
		<div className='container'>
			<h1>Welcome to Tauri!</h1>

			<div className='row'>
				<a href='https://vitejs.dev' target='_blank'>
					<img src='/vite.svg' className='logo vite' alt='Vite logo' />
				</a>
				<a href='https://tauri.app' target='_blank'>
					<img src='/tauri.svg' className='logo tauri' alt='Tauri logo' />
				</a>
				<a href='https://reactjs.org' target='_blank'>
					<img src={reactLogo} className='logo react' alt='React logo' />
				</a>
			</div>

			<p>Click on the Tauri, Vite, and React logos to learn more.</p>

			<form
				className='row'
				onSubmit={(e) => {
					e.preventDefault()
					createWallet()
				}}>
				{/* <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        /> */}
				<button type='submit'>Create New Wallet</button>
			</form>

			<form
				className='row'
				onSubmit={(e) => {
					e.preventDefault()
					createDesc()
				}}>
				{/* <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        /> */}
				<button type='submit'>Create desc</button>
			</form>

			{/* <p>{greetMsg}</p> */}
		</div>
	)
}

export default App
