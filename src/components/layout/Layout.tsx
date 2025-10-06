import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { InitialSyncDialog } from '@/components/sync/InitialSyncDialog'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
      <InitialSyncDialog />
    </div>
  )
}
