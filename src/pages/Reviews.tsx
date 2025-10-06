import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewHome, ConfidentialBanner } from '@/components/review'
import { useReviewsStore } from '@/store/reviewStore'
import { Home, Target, MessageSquare, FileText, Users, Award } from 'lucide-react'

export default function Reviews() {
  const { id } = useParams<{ id: string }>()
  const { byId } = useReviewsStore()
  const cycle = byId(id || '')

  if (!cycle) {
    return (
      <div className="container mx-auto py-6">
        <div className="py-12 text-center text-muted-foreground">Review cycle not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="home" className="space-y-4">
        <TabsList>
          <TabsTrigger value="home">
            <Home className="mr-2 h-4 w-4" />
            Home
          </TabsTrigger>
          <TabsTrigger value="impact">
            <Target className="mr-2 h-4 w-4" />
            Impact
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="self">
            <FileText className="mr-2 h-4 w-4" />
            Self-Review
          </TabsTrigger>
          <TabsTrigger value="calibration">
            <Users className="mr-2 h-4 w-4" />
            Calibration
          </TabsTrigger>
          <TabsTrigger value="promotion">
            <Award className="mr-2 h-4 w-4" />
            Promotion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <ReviewHome />
        </TabsContent>

        <TabsContent value="impact">
          <ConfidentialBanner />
          <div className="mt-4 py-12 text-center text-muted-foreground">
            Impact tracker - coming soon
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <ConfidentialBanner />
          <div className="mt-4 py-12 text-center text-muted-foreground">
            Feedback management - coming soon
          </div>
        </TabsContent>

        <TabsContent value="self">
          <ConfidentialBanner />
          <div className="mt-4 py-12 text-center text-muted-foreground">
            Self-review composer - coming soon
          </div>
        </TabsContent>

        <TabsContent value="calibration">
          <ConfidentialBanner />
          <div className="mt-4 py-12 text-center text-muted-foreground">
            Calibration prep - coming soon
          </div>
        </TabsContent>

        <TabsContent value="promotion">
          <ConfidentialBanner />
          <div className="mt-4 py-12 text-center text-muted-foreground">
            Promotion packet - coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
