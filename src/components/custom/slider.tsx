import { cn } from '@/lib/utils'
import { Slider } from '../ui/slider'

const MAX = 1024

export const CustomSlider = () => {
	const getLabels = (max: number) => {
		const labels = []
		for (let i = 1; i <= max; i *= 2) {
			labels.push(i)
		}
		return labels
	}

	const labels = getLabels(MAX)

	return (
		<div>
			<Slider contextMenu='adsf' defaultValue={[33]} max={MAX} step={1} />

			<div className='mt-1.5 flex flex-row justify-between'>
				{Array.from({ length: MAX + 1 }).map((_, i) => (
					<span
						key={`${i}`}
						className={cn('text-sm font-light', {
							'text-10 opacity-40': !labels.includes(i)
						})}
						role='presentation'>
						{labels.includes(i) ? i : ' '}
					</span>
				))}
			</div>
		</div>
	)
}
