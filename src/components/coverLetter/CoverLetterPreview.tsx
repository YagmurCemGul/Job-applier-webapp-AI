import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, CheckCircle, FileText, File, FileType, ExternalLink } from 'lucide-react'
import { CoverLetterResult } from '@/types/coverLetter.types'
import { coverLetterService } from '@/services/coverLetter.service'
import { exportService } from '@/services/export.service'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CoverLetterPreviewProps {
  letter: CoverLetterResult
}

export function CoverLetterPreview({ letter }: CoverLetterPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await coverLetterService.copyToClipboard(letter.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    setExporting(format)
    setExportSuccess(null)

    try {
      const fileName = `Cover_Letter_${new Date().toISOString().split('T')[0]}.${format}`
      await exportService.export({
        format,
        content: letter.content,
        fileName,
      })
      setExportSuccess(format)
      setTimeout(() => setExportSuccess(null), 3000)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(null)
    }
  }

  const handleGoogleDocs = () => {
    exportService.exportToGoogleDocs(letter.content)
  }

  return (
    <div className="space-y-4">
      {/* Preview Card */}
      <Card>
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Cover Letter</h3>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">{letter.metadata.wordCount} words</Badge>
                <Badge variant="secondary">{letter.metadata.characterCount} characters</Badge>
              </div>
            </div>

            {/* Copy Button */}
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="bg-white p-8">
            <div className="mx-auto max-w-3xl">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {letter.content}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Export Options */}
      <Card className="p-6">
        <h4 className="mb-4 font-semibold">Download Options</h4>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* PDF */}
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="h-auto justify-start py-3"
          >
            <FileText className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">PDF</div>
              <div className="text-xs text-gray-500">Universal format</div>
            </div>
            {exportSuccess === 'pdf' && <CheckCircle className="ml-auto h-4 w-4 text-green-600" />}
          </Button>

          {/* DOCX */}
          <Button
            variant="outline"
            onClick={() => handleExport('docx')}
            disabled={exporting !== null}
            className="h-auto justify-start py-3"
          >
            <File className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">DOCX</div>
              <div className="text-xs text-gray-500">Editable format</div>
            </div>
            {exportSuccess === 'docx' && <CheckCircle className="ml-auto h-4 w-4 text-green-600" />}
          </Button>

          {/* TXT */}
          <Button
            variant="outline"
            onClick={() => handleExport('txt')}
            disabled={exporting !== null}
            className="h-auto justify-start py-3"
          >
            <FileType className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">TXT</div>
              <div className="text-xs text-gray-500">Plain text</div>
            </div>
            {exportSuccess === 'txt' && <CheckCircle className="ml-auto h-4 w-4 text-green-600" />}
          </Button>

          {/* Google Docs */}
          <Button
            variant="outline"
            onClick={handleGoogleDocs}
            disabled={exporting !== null}
            className="h-auto justify-start py-3"
          >
            <ExternalLink className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Google Docs</div>
              <div className="text-xs text-gray-500">Edit online</div>
            </div>
          </Button>
        </div>

        {exportSuccess && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Downloaded as {exportSuccess.toUpperCase()}!</AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Suggestions */}
      {letter.metadata.suggestions && letter.metadata.suggestions.length > 0 && (
        <Card className="p-6">
          <h4 className="mb-3 font-semibold">Suggestions</h4>
          <ul className="space-y-2">
            {letter.metadata.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1 text-primary">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
