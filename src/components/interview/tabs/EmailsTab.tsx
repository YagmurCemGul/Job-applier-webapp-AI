import { Card, CardContent } from '@/components/ui/card'
import type { Interview } from '@/types/interview.types'

export default function EmailsTab({ interview }: { interview: Interview }) {
  return (
    <Card>
      <CardContent className="p-6 text-center text-muted-foreground">
        Email integration - coming soon
      </CardContent>
    </Card>
  )
}
