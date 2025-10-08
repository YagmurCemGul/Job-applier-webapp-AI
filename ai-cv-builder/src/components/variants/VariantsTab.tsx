import VariantToolbar from './VariantToolbar'
import VariantList from './VariantList'
import VariantDiffViewer from './VariantDiffViewer'
import VariantHistory from './VariantHistory'

/**
 * Main Variants tab content
 */
export default function VariantsTab() {
  return (
    <div className="grid xl:grid-cols-2 gap-6">
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
