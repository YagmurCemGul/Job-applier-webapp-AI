import CLToolbar from './CLToolbar'
import CLEditor from './CLEditor'
import CLPreview from './CLPreview'
import CLKeywordAssist from './CLKeywordAssist'
import CLSavedList from './CLSavedList'
import CLHistory from './CLHistory'

export default function CoverLetterTab() {
  return (
    <div className="grid xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-4">
        <CLToolbar />
        <div className="grid lg:grid-cols-2 gap-4">
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
