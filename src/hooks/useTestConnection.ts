import { useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/tauri'

interface IProps {
	url: string
	//network: string
}
export const useTestConnection = ({ url }: IProps) => {
	const testConnectionQuery = useQuery({
		queryKey: ['test_connection', url],
		queryFn: async () => {
			const res = await invoke('test_connection', {
				url
			})
			return res
		}
		//enabled: !!ur && !!changeDescriptor
	})

	const status = !!testConnectionQuery.data ? 'Connected' : 'Not Connected'

	return {
		status
	}
}
