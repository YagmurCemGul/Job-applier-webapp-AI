import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fileService, ParsedCVData } from '@/services/file.service'

interface CVUploadProps {
  onUploadSuccess: (data: ParsedCVData) => void
  onUploadError?: (error: string) => void
}

export function CVUpload({ onUploadSuccess, onUploadError }: CVUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploading(true)
      setError(null)
      setSuccess(false)

      try {
        const parsedData = await fileService.parseCV(file)
        setUploadedFile(file)
        setSuccess(true)
        onUploadSuccess(parsedData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed'
        setError(errorMessage)
        onUploadError?.(errorMessage)
      } finally {
        setUploading(false)
      }
    },
    [onUploadSuccess, onUploadError]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const removeFile = () => {
    setUploadedFile(null)
    setError(null)
    setSuccess(false)
  }

  return (
    <Card className="p-6">
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors duration-200 ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'} ${uploading ? 'pointer-events-none opacity-50' : ''} `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-4">
            {uploading ? (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}

            <div>
              <p className="text-lg font-medium">
                {uploading ? 'Uploading...' : 'Drop your CV here'}
              </p>
              <p className="mt-1 text-sm text-gray-500">or click to browse</p>
            </div>

            <div className="text-xs text-gray-400">
              Supported formats: PDF, DOCX, DOC, TXT (Max 5MB)
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>CV uploaded and parsed successfully!</AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
