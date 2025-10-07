import { useUIStore } from '@/store'

export function useToast() {
  const addToast = useUIStore((state) => state.addToast)

  const toast = {
    success: (title: string, description?: string) =>
      addToast({ title, description, type: 'success' }),
    
    error: (title: string, description?: string) =>
      addToast({ title, description, type: 'error' }),
    
    warning: (title: string, description?: string) =>
      addToast({ title, description, type: 'warning' }),
    
    info: (title: string, description?: string) =>
      addToast({ title, description, type: 'info' }),
  }

  return toast
}