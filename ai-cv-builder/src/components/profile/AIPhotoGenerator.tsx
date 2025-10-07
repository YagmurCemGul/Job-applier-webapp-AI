import { useState } from 'react'
import { Sparkles, Loader2, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/common/ImageUpload'
import { aiImageService, AIImageResult } from '@/services/ai-image.service'
import { storageService } from '@/services/storage.service'
import { userService } from '@/services/user.service'
import { useAuth, useToast } from '@/hooks'
import { cn } from '@/lib/utils'

interface AIPhotoGeneratorProps {
  userId: string
  onPhotoSelect?: (url: string) => void
}

type PhotoStyle = 'professional' | 'business' | 'casual' | 'creative'

export function AIPhotoGenerator({ userId, onPhotoSelect }: AIPhotoGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'upload' | 'style' | 'generating' | 'select'>('upload')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle>('professional')
  const [generatedPhotos, setGeneratedPhotos] = useState<AIImageResult[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { updateUser } = useAuth()
  const toast = useToast()

  const styles: { value: PhotoStyle; label: string; description: string }[] = [
    {
      value: 'professional',
      label: 'Professional',
      description: 'Corporate headshot with formal attire',
    },
    {
      value: 'business',
      label: 'Business',
      description: 'Executive style with office background',
    },
    {
      value: 'casual',
      label: 'Business Casual',
      description: 'Smart casual and approachable',
    },
    {
      value: 'creative',
      label: 'Creative',
      description: 'Modern and artistic style',
    },
  ]

  const handleImageUpload = (image: string) => {
    setUploadedImage(image)
    setStep('style')
  }

  const handleGenerate = async () => {
    if (!uploadedImage) return

    try {
      setIsGenerating(true)
      setStep('generating')

      const results = await aiImageService.generateLinkedInPhoto(uploadedImage, selectedStyle)
      setGeneratedPhotos(results)
      setStep('select')
    } catch (error: any) {
      console.error('AI generation error:', error)
      toast.error('Generation failed', error.message || 'Failed to generate photos')
      setStep('style')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSavePhoto = async () => {
    if (!selectedPhoto) return

    try {
      setIsSaving(true)

      // If it's a base64 image, upload to storage
      let photoURL = selectedPhoto
      if (selectedPhoto.startsWith('data:')) {
        const blob = storageService.base64ToBlob(selectedPhoto)
        const file = storageService.blobToFile(blob, 'ai-avatar.jpg')
        const storagePath = storageService.getUserAvatarPath(userId, file.name)
        photoURL = await storageService.uploadFile(file, storagePath)
      }

      // Update user profile
      await userService.updateUserProfile(userId, {
        profilePhoto: photoURL,
      })

      // Update local state
      updateUser({ profilePhoto: photoURL })

      if (onPhotoSelect) {
        onPhotoSelect(photoURL)
      }

      toast.success('Success!', 'AI-generated photo saved as your profile picture')
      handleClose()
    } catch (error: any) {
      console.error('Save photo error:', error)
      toast.error('Save failed', error.message || 'Failed to save photo')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setStep('upload')
    setUploadedImage(null)
    setGeneratedPhotos([])
    setSelectedPhoto(null)
  }

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `ai-linkedin-photo-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Download failed', 'Failed to download image')
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
        <Sparkles className="mr-2 h-4 w-4" />
        Generate AI Photo
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              <Sparkles className="mr-2 inline h-5 w-5 text-primary" />
              AI LinkedIn Photo Generator
            </DialogTitle>
            <DialogDescription>
              Upload a photo and let AI create professional LinkedIn profile pictures
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Upload */}
            {step === 'upload' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <ImageUpload
                    value={uploadedImage || undefined}
                    onChange={handleImageUpload}
                    aspectRatio={1}
                    maxSize={5}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Upload a clear selfie or portrait photo for best results
                </p>
              </div>
            )}

            {/* Step 2: Choose Style */}
            {step === 'style' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={uploadedImage!}
                    alt="Uploaded"
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                </div>

                <div>
                  <Label className="text-base">Choose a style:</Label>
                  <RadioGroup
                    value={selectedStyle}
                    onValueChange={(value) => setSelectedStyle(value as PhotoStyle)}
                    className="mt-3 grid gap-3 md:grid-cols-2"
                  >
                    {styles.map((style) => (
                      <div key={style.value}>
                        <RadioGroupItem
                          value={style.value}
                          id={style.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={style.value}
                          className="flex cursor-pointer flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary"
                        >
                          <span className="font-semibold">{style.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {style.description}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Back
                  </Button>
                  <Button onClick={handleGenerate}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Photos
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Generating */}
            {step === 'generating' && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-lg font-medium">Generating your photos...</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This may take 30-60 seconds
                </p>
              </div>
            )}

            {/* Step 4: Select Photo */}
            {step === 'select' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {generatedPhotos.map((photo, index) => (
                    <Card
                      key={index}
                      className={cn(
                        'cursor-pointer transition-all hover:ring-2 hover:ring-primary',
                        selectedPhoto === photo.url && 'ring-2 ring-primary'
                      )}
                      onClick={() => setSelectedPhoto(photo.url)}
                    >
                      <CardContent className="p-2">
                        <div className="relative">
                          <img
                            src={photo.url}
                            alt={`Generated ${index + 1}`}
                            className="aspect-square w-full rounded-lg object-cover"
                          />
                          {selectedPhoto === photo.url && (
                            <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute bottom-2 right-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload(photo.url, index)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep('style')}>
                    Regenerate
                  </Button>
                  <Button onClick={handleSavePhoto} disabled={!selectedPhoto || isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save as Profile Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}