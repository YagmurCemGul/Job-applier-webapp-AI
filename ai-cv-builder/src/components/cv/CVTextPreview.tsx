import { useState } from 'react'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks'

interface CVTextPreviewProps {
  text: string
  metadata?: {
    fileName?: string
    fileSize?: number
    fileType?: string
    pageCount?: number
  }
}

export function CVTextPreview({ text, metadata }: CVTextPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const toast = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast.success('Copied!', 'Text copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('Failed', 'Failed to copy text')
    }
  }

  const previewText = isExpanded ? text : text.slice(0, 500)
  const hasMore = text.length > 500

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Extracted Text</CardTitle>
            <CardDescription>
              {metadata?.fileName && `From ${metadata.fileName}`}
              {metadata?.pageCount && ` • ${metadata.pageCount} pages`}
              {` • ${text.length} characters`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            {hasMore && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={cn('rounded-md border p-4', isExpanded ? 'h-96' : 'h-48')}>
          <pre className="whitespace-pre-wrap text-sm">{previewText}</pre>
          {!isExpanded && hasMore && (
            <div className="mt-2">
              <Button variant="link" onClick={() => setIsExpanded(true)} className="p-0">
                Show more...
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}