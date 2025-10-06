import { Card, CardContent } from '@/components/ui/card'
import type { Interview } from '@/types/interview.types'

export default function FilesTab({ interview }: { interview: Interview }) {
  return (
    <Card>
      <CardContent className="p-6 text-center text-muted-foreground">
        File attachments feature - coming soon
      </CardContent>
    </Card>
  )
}
