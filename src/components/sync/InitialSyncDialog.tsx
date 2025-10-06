import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Cloud, HardDrive, Loader2, AlertCircle } from 'lucide-react'
import { useCVDataStore } from '@/store/cvDataStore'
import { useAuthStore } from '@/store/authStore'
import { firestoreService } from '@/services/firestore.service'

export function InitialSyncDialog() {
  const { user } = useAuthStore()
  const { savedCVs, loadFromCloud, syncToCloud } = useCVDataStore()
  const [open, setOpen] = useState(false)
  const [hasCloudData, setHasCloudData] = useState(false)
  const [hasLocalData, setHasLocalData] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSyncStatus = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const cloudExists = await firestoreService.hasCloudCVs(user.uid)
        const localExists = savedCVs.length > 0

        setHasCloudData(cloudExists)
        setHasLocalData(localExists)

        // Show dialog if there's a conflict (both local and cloud data exist)
        if (cloudExists && localExists) {
          setOpen(true)
        } else if (cloudExists) {
          // Only cloud data, auto-load
          await loadFromCloud()
        } else if (localExists) {
          // Only local data, auto-sync to cloud
          await syncToCloud()
        }
      } catch (error) {
        console.error('Error checking sync status:', error)
        setError('Failed to check cloud sync status')
      } finally {
        setLoading(false)
      }
    }

    checkSyncStatus()
  }, [user])

  const handleUseCloud = async () => {
    setSyncing(true)
    setError(null)
    try {
      await loadFromCloud()
      setOpen(false)
    } catch (error) {
      setError('Failed to load data from cloud')
    } finally {
      setSyncing(false)
    }
  }

  const handleUseLocal = async () => {
    setSyncing(true)
    setError(null)
    try {
      await syncToCloud()
      setOpen(false)
    } catch (error) {
      setError('Failed to sync data to cloud')
    } finally {
      setSyncing(false)
    }
  }

  const handleMerge = async () => {
    setSyncing(true)
    setError(null)
    try {
      // Load from cloud will merge automatically
      await loadFromCloud()
      // Then sync back to ensure everything is saved
      await syncToCloud()
      setOpen(false)
    } catch (error) {
      setError('Failed to merge data')
    } finally {
      setSyncing(false)
    }
  }

  if (!open || loading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sync Your CVs</DialogTitle>
          <DialogDescription>
            We found CVs both on this device and in the cloud. Choose how to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg border p-4">
              <HardDrive className="mx-auto mb-2 h-8 w-8 text-gray-600" />
              <div className="font-medium">Local Device</div>
              <div className="text-2xl font-bold text-primary">{savedCVs.length}</div>
              <div className="text-xs text-gray-500">CVs</div>
            </div>

            <div className="rounded-lg border p-4">
              <Cloud className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <div className="font-medium">Cloud</div>
              <div className="text-2xl font-bold text-blue-600">{hasCloudData ? '?' : '0'}</div>
              <div className="text-xs text-gray-500">CVs</div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleUseCloud}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="mr-2 h-4 w-4" />
              )}
              Use Cloud Data
              <span className="ml-auto text-xs text-gray-500">Replace local</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleUseLocal}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <HardDrive className="mr-2 h-4 w-4" />
              )}
              Use Local Data
              <span className="ml-auto text-xs text-gray-500">Upload to cloud</span>
            </Button>

            <Button variant="default" className="w-full" onClick={handleMerge} disabled={syncing}>
              {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Merge Both'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <p className="w-full text-center text-xs text-gray-500">
            Merge will keep all CVs and use the newest version for duplicates
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
