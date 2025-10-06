import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { aiRoute } from '@/services/ai/router.service'
import { Play } from 'lucide-react'

export default function AITestConsole() {
  const [input, setInput] = useState('Say hello in one sentence.')
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRun = async () => {
    setLoading(true)
    try {
      const r = await aiRoute({ task: 'generate', prompt: input }, { allowCache: true })
      setOut((r.text || '') + (r.cached ? ' (cached)' : ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="font-semibold">AI Test Console</div>
      <Textarea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter test prompt..."
      />
      <Button onClick={handleRun} disabled={loading}>
        <Play className="mr-2 h-4 w-4" />
        {loading ? 'Running...' : 'Run'}
      </Button>
      <pre className="whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">{out}</pre>
    </div>
  )
}
