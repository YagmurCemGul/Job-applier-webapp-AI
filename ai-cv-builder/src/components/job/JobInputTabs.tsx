import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import JobInput from './JobInput'
import JobStructuredForm from './JobStructuredForm'
import SavedJobsList from './SavedJobsList'

/**
 * Job posting main component with two sub-tabs:
 * - Input: Paste/URL/File + Structured Form
 * - Saved: List of saved job postings
 */
export default function JobInputTabs() {
  return (
    <Tabs defaultValue="input" className="w-full">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="input">Input</TabsTrigger>
        <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
      </TabsList>

      <TabsContent value="input" className="mt-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Input methods */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Parse Job Posting</h3>
              <JobInput />
            </div>
          </div>

          {/* Right: Structured form */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Job Details</h3>
              <JobStructuredForm />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="saved" className="mt-6">
        <SavedJobsList />
      </TabsContent>
    </Tabs>
  )
}
