import AISettingsPanel from '@/components/ai/AISettingsPanel'
import AITestConsole from '@/components/ai/AITestConsole'
import { Card } from '@/components/ui/card'

export default function SettingsAI() {
  return (
    <div className="container mx-auto space-y-6 py-6">
      <Card className="p-6">
        <h1 className="mb-6 text-2xl font-bold">AI Settings</h1>
        <AISettingsPanel />
      </Card>

      <Card className="p-6">
        <AITestConsole />
      </Card>
    </div>
  )
}
