import { Progress } from '@/components/ui/progress'
import { formatFileSize } from '@/lib/formatters'

interface UploadProgressProps {
  progress: number
  bytesTransferred: number
  totalBytes: number
}

export function UploadProgress({ progress, bytesTransferred, totalBytes }: UploadProgressProps) {
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
