import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface CVPreviewFullProps {
  content: string
  atsScore?: number
}

export function CVPreviewFull({ content, atsScore }: CVPreviewFullProps) {
  // Convert markdown-like formatting to HTML
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="mb-3 mt-6 text-2xl font-bold">
            {line.replace(/^#\s*/, '')}
          </h1>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="mb-2 mt-4 text-xl font-semibold">
            {line.replace(/^##\s*/, '')}
          </h2>
        )
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="mb-2 mt-3 text-lg font-medium">
            {line.replace(/^###\s*/, '')}
          </h3>
        )
      }

      // Bold text
      if (line.match(/^\*\*.*\*\*$/)) {
        return (
          <p key={index} className="mt-2 font-semibold">
            {line.replace(/\*\*/g, '')}
          </p>
        )
      }

      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <li key={index} className="ml-6 mt-1">
            {line.replace(/^[\s]*[•-]\s*/, '')}
          </li>
        )
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />
      }

      // Regular text
      return (
        <p key={index} className="mt-1">
          {line}
        </p>
      )
    })
  }

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between border-b p-6">
        <h3 className="text-lg font-semibold">CV Preview</h3>
        {atsScore !== undefined && (
          <Badge variant={atsScore >= 80 ? 'default' : 'secondary'}>ATS Score: {atsScore}</Badge>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="bg-white p-8">
          <div className="mx-auto max-w-3xl space-y-1">{formatContent(content)}</div>
        </div>
      </ScrollArea>
    </Card>
  )
}
