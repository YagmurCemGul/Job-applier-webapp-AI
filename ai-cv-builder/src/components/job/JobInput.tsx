import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import JobPasteTab from './JobPasteTab'
import JobUrlTab from './JobUrlTab'
import JobFileTab from './JobFileTab'

/**
 * Job posting input component with three input methods
 */
export default function JobInput() {
  return (
    <div className="w-full">
      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="paste">Paste Text</TabsTrigger>
          <TabsTrigger value="url">From URL</TabsTrigger>
          <TabsTrigger value="file">Upload File</TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <JobPasteTab />
        </TabsContent>
        <TabsContent value="url">
          <JobUrlTab />
        </TabsContent>
        <TabsContent value="file">
          <JobFileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
