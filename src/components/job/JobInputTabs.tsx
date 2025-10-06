import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import JobInput from './JobInput'
import JobStructuredForm from './JobStructuredForm'
import SavedJobsList from './SavedJobsList'

/**
 * Sub-tabs for Job flow: Input (paste/URL/file + form) and Saved (list)
 */
export default function JobInputTabs() {
  return (
    <Tabs defaultValue="input" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="input">Input</TabsTrigger>
        <TabsTrigger value="saved">Saved</TabsTrigger>
      </TabsList>

      <TabsContent value="input" className="mt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Parse Job Posting</h3>
            <JobInput />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Details</h3>
            <JobStructuredForm />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="saved" className="mt-6">
        <SavedJobsList />
      </TabsContent>
    </Tabs>
  )
}
