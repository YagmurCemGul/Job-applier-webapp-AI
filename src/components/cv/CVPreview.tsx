import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ParsedCVData } from '@/services/file.service'

interface CVPreviewProps {
  data: ParsedCVData
}

export function CVPreview({ data }: CVPreviewProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Extracted CV Text</h3>

      <div className="mb-4 text-sm text-gray-600">
        <div>File: {data.metadata.fileName}</div>
        <div>Type: {data.metadata.fileType}</div>
        <div>Size: {(data.metadata.fileSize / 1024).toFixed(2)} KB</div>
        {data.metadata.pageCount && <div>Pages: {data.metadata.pageCount}</div>}
      </div>

      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm">{data.text}</pre>
      </ScrollArea>
    </Card>
  )
}
