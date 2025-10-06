import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewHome, ConfidentialBanner } from '@/components/review'
import { useReviewsStore } from '@/store/reviewStore'
import {
  Home,
  Target,
  MessageSquare,
  FileText,
  Users,
  Award
} from 'lucide-react'

export default function Reviews() {
  const { id } = useParams<{ id: string }>()
  const { byId } = useReviewsStore()
  const cycle = byId(id || '')

  if (!cycle) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12 text-muted-foreground">
          Review cycle not found
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="home" className="space-y-4">
        <TabsList>
          <TabsTrigger value="home">
            <Home className="h-4 w-4 mr-2" />
            Home
          </TabsTrigger>
          <TabsTrigger value="impact">
            <Target className="h-4 w-4 mr-2" />
            Impact
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="self">
            <FileText className="h-4 w-4 mr-2" />
            Self-Review
          </TabsTrigger>
          <TabsTrigger value="calibration">
            <Users className="h-4 w-4 mr-2" />
            Calibration
          </TabsTrigger>
          <TabsTrigger value="promotion">
            <Award className="h-4 w-4 mr-2" />
            Promotion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <ReviewHome />
        </TabsContent>

        <TabsContent value="impact">
          <ConfidentialBanner />
          <div className="mt-4 text-center py-12 text-muted-foreground">
            Impact tracker - coming soon
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <ConfidentialBanner />
          <div className="mt-4 text-center py-12 text-muted-foreground">
            Feedback management - coming soon
          </div>
        </TabsContent>

        <TabsContent value="self">
          <ConfidentialBanner />
          <div className="mt-4 text-center py-12 text-muted-foreground">
            Self-review composer - coming soon
          </div>
        </TabsContent>

        <TabsContent value="calibration">
          <ConfidentialBanner />
          <div className="mt-4 text-center py-12 text-muted-foreground">
            Calibration prep - coming soon
          </div>
        </TabsContent>

        <TabsContent value="promotion">
          <ConfidentialBanner />
          <div className="mt-4 text-center py-12 text-muted-foreground">
            Promotion packet - coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
