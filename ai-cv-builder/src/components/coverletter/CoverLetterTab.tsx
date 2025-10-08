/**
 * Cover Letter Tab - Step 30
 * Main tab component integrating all cover letter features
 */

import CLToolbar from './CLToolbar'
import CLEditor from './CLEditor'
import CLPreview from './CLPreview'
import CLKeywordAssist from './CLKeywordAssist'
import CLSavedList from './CLSavedList'
import CLHistory from './CLHistory'
import { Card } from '@/components/ui/card'

export default function CoverLetterTab() {
  return (
    <div className="grid xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-4">
        <Card className="p-4">
          <CLToolbar />
        </Card>
        <Card className="p-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <CLEditor />
            <CLPreview />
          </div>
        </Card>
        <Card className="p-4">
          <CLKeywordAssist />
        </Card>
        <Card className="p-4">
          <CLHistory />
        </Card>
      </div>
      <div>
        <Card className="p-4">
          <div className="font-semibold mb-4">Saved Cover Letters</div>
          <CLSavedList />
        </Card>
      </div>
    </div>
  )
}
