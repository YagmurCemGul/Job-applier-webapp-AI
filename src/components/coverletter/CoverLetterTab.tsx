import CLToolbar from './CLToolbar'
import CLEditor from './CLEditor'
import CLPreview from './CLPreview'
import CLKeywordAssist from './CLKeywordAssist'
import CLSavedList from './CLSavedList'
import CLHistory from './CLHistory'

export default function CoverLetterTab() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <CLToolbar />
        <div className="grid gap-4 lg:grid-cols-2">
          <CLEditor />
          <CLPreview />
        </div>
        <CLKeywordAssist />
        <CLHistory />
      </div>
      <div>
        <CLSavedList />
      </div>
    </div>
  )
}
