import { useState } from 'react'
import { Button } from '../ui/button'
import { CopyIcon } from 'lucide-react'

export const CopyComponent = ({ textToCopy }: { textToCopy: string }) => {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(textToCopy)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000) // Reset the copied state after 2 seconds
		} catch (err) {
			console.error('Failed to copy: ', err)
		}
	}

	return (
		<div>
			<Button
				onClick={(e) => {
					e.preventDefault()
					handleCopy()
				}}
				size='sm'
				variant='outline'
				className='h-7 gap-1 text-sm'>
				<CopyIcon className='h-3.5 w-3.5' />
				{copied ? 'Copied!' : 'Copy'}
			</Button>
		</div>
	)
}
