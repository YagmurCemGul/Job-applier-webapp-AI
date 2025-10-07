import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImageCropper } from './ImageCropper'
import { storageService } from '@/services/storage.service'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  className?: string
  aspectRatio?: number
  maxSize?: number // in MB
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  aspectRatio = 1,
  maxSize = 5,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)
      const file = acceptedFiles[0]

      if (!file) return

      // Validate file
      const validation = storageService.validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
    },
    [maxSize]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: disabled || isUploading,
  })

  const handleCropComplete = (croppedImage: string) => {
    setCropperOpen(false)
    onChange(croppedImage)
    setPreview(null)
  }

  const handleRemove = () => {
    setPreview(null)
    if (onRemove) {
      onRemove()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview */}
      {value && !preview && (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="h-32 w-32 rounded-full object-cover ring-2 ring-border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!value && !preview && (
        <div
          {...getRootProps()}
          className={cn(
            'flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-colors',
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            {isUploading ? (
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {isDragActive ? 'Drop here' : 'Upload'}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        JPG, PNG or WebP. Max {maxSize}MB.
      </p>

      {/* Cropper */}
      {preview && cropperOpen && (
        <ImageCropper
          imageSrc={preview}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropperOpen(false)
            setPreview(null)
          }}
          aspectRatio={aspectRatio}
          open={cropperOpen}
        />
      )}
    </div>
  )
}