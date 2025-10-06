import VariantToolbar from './VariantToolbar'
import VariantList from './VariantList'
import VariantDiffViewer from './VariantDiffViewer'
import VariantHistory from './VariantHistory'

export default function VariantsTab() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-4">
        <VariantToolbar />
        <VariantList />
        <VariantHistory />
      </div>
      <div>
        <VariantDiffViewer />
      </div>
    </div>
  )
}
