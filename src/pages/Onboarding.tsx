import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OnboardingHome, PlanBuilder, ConsentMiningBanner } from '@/components/onboarding'
import { useOnboardingStore } from '@/store/onboardingStore'
import { Home, ListTodo, Users, Calendar, Target, FileText } from 'lucide-react'

export default function Onboarding() {
  const { id } = useParams<{ id: string }>()
  const { getById } = useOnboardingStore()
  const plan = getById(id || '')

  if (!plan) {
    return (
      <div className="container mx-auto py-6">
        <div className="py-12 text-center text-muted-foreground">Onboarding plan not found</div>
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
          <TabsTrigger value="plan">
            <ListTodo className="mr-2 h-4 w-4" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="stakeholders">
            <Users className="mr-2 h-4 w-4" />
            Stakeholders
          </TabsTrigger>
          <TabsTrigger value="oneonones">
            <Calendar className="mr-2 h-4 w-4" />
            1:1s
          </TabsTrigger>
          <TabsTrigger value="okrs">
            <Target className="mr-2 h-4 w-4" />
            OKRs
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <FileText className="mr-2 h-4 w-4" />
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
          <div className="py-12 text-center text-muted-foreground">
            Stakeholder management - coming soon
          </div>
        </TabsContent>

        <TabsContent value="oneonones">
          <div className="py-12 text-center text-muted-foreground">
            1:1 management - coming soon
          </div>
        </TabsContent>

        <TabsContent value="okrs">
          <div className="py-12 text-center text-muted-foreground">OKR tracking - coming soon</div>
        </TabsContent>

        <TabsContent value="evidence">
          <div className="py-12 text-center text-muted-foreground">
            Evidence binder - coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
