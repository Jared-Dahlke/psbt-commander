import { z } from 'zod'

import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { UserNav } from './components/user-nav'
import { taskSchema } from './data/schema'
import { mockTasks } from './data/tasks'

// Simulate a database read for tasks.

export function UtxoTable() {
	const tasks = z.array(taskSchema).parse(mockTasks)

	return (
		<>
			<div className=' h-full flex-1 flex-col space-y-8 md:flex'>
				<div className='flex items-center justify-between space-y-2'></div>
				<DataTable data={tasks} columns={columns} />
			</div>
		</>
	)
}
