import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useUIStore } from '@/store'

export function Toaster() {
  const toasts = useUIStore((state) => state.toasts)

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, type, ...props }) {
        return (
          <Toast key={id} {...props} variant={type === 'error' ? 'destructive' : 'default'}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
