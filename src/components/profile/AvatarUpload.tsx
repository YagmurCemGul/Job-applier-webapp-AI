import { useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/common/ImageUpload'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { storageService } from '@/services/storage.service'
import { userService } from '@/services/user.service'
import { useAuth, useToast } from '@/hooks'

interface AvatarUploadProps {
  userId: string
  currentAvatar?: string
  firstName?: string
  lastName?: string
  onUploadComplete?: (url: string) => void
}

export function AvatarUpload({
  userId,
  currentAvatar,
  firstName = '',
  lastName = '',
  onUploadComplete,
}: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [tempAvatar, setTempAvatar] = useState<string | null>(null)
  const { updateUser } = useAuth()
  const toast = useToast()

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

  const handleImageChange = (base64Image: string) => {
    setTempAvatar(base64Image)
  }

  const handleUpload = async () => {
    if (!tempAvatar) return

    try {
      setIsUploading(true)

      // Convert base64 to blob
      const blob = storageService.base64ToBlob(tempAvatar, 'image/jpeg')
      const file = storageService.blobToFile(blob, 'avatar.jpg')

      // Generate storage path
      const storagePath = storageService.getUserAvatarPath(userId, file.name)

      // Upload to Firebase Storage
      const downloadURL = await storageService.uploadFile(file, storagePath)

      // Update user profile
      await userService.updateUserProfile(userId, {
        profilePhoto: downloadURL,
      })

      // Update local state
      updateUser({ profilePhoto: downloadURL })

      if (onUploadComplete) {
        onUploadComplete(downloadURL)
      }

      toast.success('Success!', 'Profile photo updated successfully')
      setIsOpen(false)
      setTempAvatar(null)
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast.error('Upload failed', error.message || 'Failed to upload profile photo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      setIsUploading(true)

      // Update user profile
      await userService.updateUserProfile(userId, {
        profilePhoto: undefined,
      })

      // Update local state
      updateUser({ profilePhoto: undefined })

      toast.success('Removed', 'Profile photo removed')
      setTempAvatar(null)
    } catch (error: any) {
      console.error('Avatar remove error:', error)
      toast.error('Failed', error.message || 'Failed to remove profile photo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="relative">
        <Avatar className="h-32 w-32 ring-2 ring-border">
          <AvatarImage src={currentAvatar} alt={`${firstName} ${lastName}`} />
          <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
        </Avatar>

        <Button
          type="button"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full"
          onClick={() => setIsOpen(true)}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Profile Photo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageUpload
                value={tempAvatar || currentAvatar}
                onChange={handleImageChange}
                onRemove={currentAvatar ? handleRemove : undefined}
                aspectRatio={1}
                maxSize={5}
                disabled={isUploading}
              />
            </div>

            {tempAvatar && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTempAvatar(null)
                    setIsOpen(false)
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
