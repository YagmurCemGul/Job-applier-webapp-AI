import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CloudOff, Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { useCVDataStore } from '@/stores/cvData.store'
import { useAuthStore } from '@/stores/auth.store'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

export function SyncStatus() {
  const { user } = useAuthStore()
  const { isSyncing, lastSyncTime, syncError, syncToCloud, loadFromCloud } = useCVDataStore()

  useEffect(() => {
    // Auto-load from cloud on mount if logged in
    if (user) {
      loadFromCloud().catch(console.error)
    }
  }, [user, loadFromCloud])

  const handleManualSync = async () => {
    try {
      await syncToCloud()
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  if (!user) {
    return null
  }

  const getSyncStatus = () => {
    if (isSyncing) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        label: 'Syncing...',
        color: 'text-blue-600',
      }
    }

    if (syncError) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Sync Error',
        color: 'text-red-600',
      }
    }

    if (lastSyncTime) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Synced',
        color: 'text-green-600',
      }
    }

    return {
      icon: <CloudOff className="h-4 w-4" />,
      label: 'Not Synced',
      color: 'text-gray-600',
    }
  }

  const status = getSyncStatus()

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 cursor-pointer ${status.color}`}>
              {status.icon}
              <span className="text-sm font-medium hidden md:inline">
                {status.label}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{status.label}</p>
              {lastSyncTime && (
                <p className="text-xs text-gray-400">
                  Last synced {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
                </p>
              )}
              {syncError && (
                <p className="text-xs text-red-400">{syncError}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={isSyncing}
        className="h-8 w-8 p-0"
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}
