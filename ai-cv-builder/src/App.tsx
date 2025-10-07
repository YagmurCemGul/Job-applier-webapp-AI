import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ToastContainer } from '@/components/common/ToastContainer'

// Loading fallback component
function AppLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<AppLoader />}>
      <RouterProvider router={router} />
      <ToastContainer />
    </Suspense>
  )
}

export default App
