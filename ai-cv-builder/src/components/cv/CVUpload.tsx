import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { fileService, ParsedCVData } from '@/services/file.service'
import { useToast } from '@/hooks'

interface CVUploadProps {
  onUploadComplete?: (parsedData: ParsedCVData) => void
  onCancel?: () => void
  disabled?: boolean
}

export function CVUpload({ onUploadComplete, onCancel, disabled = false }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedCVData | null>(null)
  const toast = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setParseError(null)
      const uploadedFile = acceptedFiles[0]

      if (!uploadedFile) return

      // Validate file
      const validation = fileService.validateCVFile(uploadedFile)
      if (!validation.valid) {
        setParseError(validation.error || 'Invalid file')
        toast.error('Upload failed', validation.error || 'Invalid file')
        return
      }

      setFile(uploadedFile)
      await handleParse(uploadedFile)
    },
    [toast]
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
    disabled: disabled || isUploading,
  })

  const handleParse = async (fileToparse: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)
      setParseError(null)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Parse file
      const parsed = await fileService.parseCV(fileToparse)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setParsedData(parsed)
      
      toast.success('Success!', `CV parsed successfully from ${fileToparse.name}`)

      if (onUploadComplete) {
        onUploadComplete(parsed)
      }
    } catch (error: any) {
      console.error('Parse error:', error)
      setParseError(error.message || 'Failed to parse CV')
      toast.error('Parse failed', error.message || 'Failed to parse CV')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setParsedData(null)
    setParseError(null)
    setUploadProgress(0)
  }

  const handleRetry = () => {
    if (file) {
      handleParse(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your CV</CardTitle>
        <CardDescription>
          Upload your existing CV in PDF, DOCX, or TXT format. We'll automatically extract your
          information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!file && (
          <div
            {...getRootProps()}
            className={cn(
              'flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground/25 hover:border-primary/50',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">
              {isDragActive ? 'Drop your CV here' : 'Drag & drop your CV here'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">or click to browse</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Supported formats: PDF, DOCX, DOC, TXT (Max 5MB)
            </p>
          </div>
        )}

        {/* File Info */}
        {file && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <FileText className="h-10 w-10 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {fileService.formatFileSize(file.size)}
                </p>
              </div>
              {!isUploading && (
                <Button variant="ghost" size="icon" onClick={handleRemove}>
                  <XCircle className="h-5 w-5 text-destructive" />
                </Button>
              )}
            </div>

            {/* Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Parsing CV...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Success */}
            {parsedData && !isUploading && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  CV parsed successfully! Found {parsedData.text.length} characters.
                  {parsedData.metadata?.pageCount && (
                    <> ({parsedData.metadata.pageCount} pages)</>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Error */}
            {parseError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {parseError && (
                <Button onClick={handleRetry} disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Retry
                </Button>
              )}
              {parsedData && (
                <Button variant="outline" onClick={() => {
                  handleRemove()
                }}>
                  Upload Different CV
                </Button>
              )}
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}