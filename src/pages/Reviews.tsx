import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewHome } from '@/components/review'
import { Home, FileText, MessageSquare, Users, Target, TrendingUp } from 'lucide-react'

export default function Reviews() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return (
      <div className="container mx-auto py-6">
        <div className="py-12 text-center text-muted-foreground">Please select a review cycle</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="home" className="space-y-4">
        <TabsList>
          <TabsTrigger value="home">
            <Home className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="impact">
            <FileText className="mr-2 h-4 w-4" />
            Impact
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="self">
            <Users className="mr-2 h-4 w-4" />
            Self-Review
          </TabsTrigger>
          <TabsTrigger value="calibration">
            <Target className="mr-2 h-4 w-4" />
            Calibration
          </TabsTrigger>
          <TabsTrigger value="promotion">
            <TrendingUp className="mr-2 h-4 w-4" />
            Promotion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <ReviewHome />
        </TabsContent>

        <TabsContent value="impact">
          <div className="py-12 text-center text-muted-foreground">
            Impact tracker - coming soon
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="py-12 text-center text-muted-foreground">
            Feedback inbox - coming soon
          </div>
        </TabsContent>

        <TabsContent value="self">
          <div className="py-12 text-center text-muted-foreground">
            Self-review composer - coming soon
          </div>
        </TabsContent>

        <TabsContent value="calibration">
          <div className="py-12 text-center text-muted-foreground">
            Calibration prep - coming soon
          </div>
        </TabsContent>

        <TabsContent value="promotion">
          <div className="py-12 text-center text-muted-foreground">
            Promotion case builder - coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
