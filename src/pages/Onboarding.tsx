import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OnboardingHome, PlanBuilder, ConsentMiningBanner } from '@/components/onboarding'
import { useOnboardingStore } from '@/store/onboardingStore'
import {
  Home,
  ListTodo,
  Users,
  Calendar,
  Target,
  FileText
} from 'lucide-react'

export default function Onboarding() {
  const { id } = useParams<{ id: string }>()
  const { getById } = useOnboardingStore()
  const plan = getById(id || '')

  if (!plan) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12 text-muted-foreground">
          Onboarding plan not found
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
          <TabsTrigger value="plan">
            <ListTodo className="h-4 w-4 mr-2" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="stakeholders">
            <Users className="h-4 w-4 mr-2" />
            Stakeholders
          </TabsTrigger>
          <TabsTrigger value="oneonones">
            <Calendar className="h-4 w-4 mr-2" />
            1:1s
          </TabsTrigger>
          <TabsTrigger value="okrs">
            <Target className="h-4 w-4 mr-2" />
            OKRs
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <FileText className="h-4 w-4 mr-2" />
            Evidence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <OnboardingHome />
        </TabsContent>

        <TabsContent value="plan">
          <ConsentMiningBanner />
          <div className="mt-4">
            <PlanBuilder plan={plan} />
          </div>
        </TabsContent>

        <TabsContent value="stakeholders">
          <div className="text-center py-12 text-muted-foreground">
            Stakeholder management - coming soon
          </div>
        </TabsContent>

        <TabsContent value="oneonones">
          <div className="text-center py-12 text-muted-foreground">
            1:1 management - coming soon
          </div>
        </TabsContent>

        <TabsContent value="okrs">
          <div className="text-center py-12 text-muted-foreground">
            OKR tracking - coming soon
          </div>
        </TabsContent>

        <TabsContent value="evidence">
          <div className="text-center py-12 text-muted-foreground">
            Evidence binder - coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
