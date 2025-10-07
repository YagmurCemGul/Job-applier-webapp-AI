import { Progress } from '@/components/ui/progress'

interface UploadProgressProps {
  progress: number
  bytesTransferred: number
  totalBytes: number
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function UploadProgress({
  progress,
  bytesTransferred,
  totalBytes,
}: UploadProgressProps) {
  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(progress)}%</span>
        <span>
          {formatFileSize(bytesTransferred)} / {formatFileSize(totalBytes)}
        </span>
      </div>
    </div>
  )
}