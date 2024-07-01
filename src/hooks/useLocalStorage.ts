import useLocalStorageState from 'use-local-storage-state'

export const useLocalStorage = () => {
	const [descriptor, setDescriptor] = useLocalStorageState<string>('descriptor')
	const [changeDescriptor, setChangeDescriptor] =
		useLocalStorageState<string>('changeDescriptor')

	const settings = localStorage.getItem('settings')
	const clientUrl = settings ? JSON.parse(settings).clientUrl : ''
	const network = settings ? JSON.parse(settings).network : ''

	return {
		descriptor,
		setDescriptor,
		changeDescriptor,
		setChangeDescriptor,
		clientUrl,
		network
	}
}
