import useLocalStorageState from 'use-local-storage-state'

export const useDescriptors = () => {
	const [descriptor, setDescriptor] = useLocalStorageState<string>('descriptor')
	const [changeDescriptor, setChangeDescriptor] =
		useLocalStorageState<string>('changeDescriptor')
	return { descriptor, setDescriptor, changeDescriptor, setChangeDescriptor }
}
