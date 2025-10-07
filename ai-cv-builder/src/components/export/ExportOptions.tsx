import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  FileText, 
  File, 
  FileType,
  Loader2,
  CheckCircle,
  ExternalLink 
} from 'lucide-react'
import { exportService, ExportFormat } from '@/services/export.service'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ExportOptionsProps {
  content: string
  fileName?: string
}

export function ExportOptions({ content, fileName }: ExportOptionsProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const [success, setSuccess] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async (format: ExportFormat) => {
    setExporting(format)
    setSuccess(null)
    setError(null)

    try {
      await exportService.export({
        format,
        content,
        fileName: fileName ? `${fileName}.${format}` : undefined,
      })

      setSuccess(format)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setTimeout(() => setError(null), 5000)
    } finally {
      setExporting(null)
    }
  }

  const handleGoogleDocs = () => {
    try {
      exportService.exportToGoogleDocs(content)
      setSuccess('docx')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to open Google Docs')
      setTimeout(() => setError(null), 5000)
    }
  }

  const exportOptions: Array<{
    format: ExportFormat
    label: string
    icon: typeof FileText
    description: string
    primary?: boolean
  }> = [
    {
      format: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Universal format, best for submission',
      primary: true,
    },
    {
      format: 'docx',
      label: 'DOCX',
      icon: File,
      description: 'Editable Microsoft Word format',
    },
    {
      format: 'txt',
      label: 'TXT',
      icon: FileType,
      description: 'Plain text, copy-paste friendly',
    },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Download className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Download Options</h3>
      </div>

      <div className="space-y-3">
        {exportOptions.map((option) => (
          <button
            key={option.format}
            onClick={() => handleExport(option.format)}
            disabled={exporting !== null}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${option.primary ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}
              ${exporting === option.format ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
              ${success === option.format ? 'border-green-500 bg-green-50' : ''}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <option.icon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{option.label}</span>
                    {option.primary && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>

              <div>
                {exporting === option.format ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : success === option.format ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Download className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </button>
        ))}

        {/* Google Docs Option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleDocs}
          variant="outline"
          className="w-full h-auto p-4"
          disabled={exporting !== null}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 text-left">
              <ExternalLink className="h-6 w-6 text-primary" />
              <div>
                <div className="font-semibold">Open in Google Docs</div>
                <p className="text-sm text-gray-600">
                  Edit and save directly to your Google Drive
                </p>
              </div>
            </div>
          </div>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            CV downloaded successfully as {success.toUpperCase()}!
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-900">
          <strong>Pro Tip:</strong> Download as PDF when submitting to ATS systems. 
          Use DOCX if you need to make further edits. TXT format is best for 
          copy-pasting into online application forms.
        </p>
      </div>
    </Card>
  )
}