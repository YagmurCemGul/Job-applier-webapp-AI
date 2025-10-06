import { useAIStore } from '@/store/aiStore'
import ProviderStatusCard from './ProviderStatusCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { AITask, AIProviderId } from '@/types/ai.types'

const TASKS: Array<{ id: AITask; label: string }> = [
  { id: 'parse', label: 'Parsing' },
  { id: 'generate', label: 'General Generation' },
  { id: 'match', label: 'Job Matching' },
  { id: 'coverLetter', label: 'Cover Letter' },
  { id: 'suggest', label: 'Keyword Suggest' },
  { id: 'embed', label: 'Embeddings' },
  { id: 'moderate', label: 'Moderation' },
]

const PROVIDERS: Array<{ id: AIProviderId; label: string }> = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'google', label: 'Google' },
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'llama-local', label: 'Llama (Local)' },
]

export default function AISettingsPanel() {
  const { settings, setModelForTask, setDefaults, setToggles, reset } = useAIStore()

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ProviderStatusCard
          name="OpenAI"
          envKey="VITE_OPENAI_API_KEY"
          doc="chat, embed, moderation"
        />
        <ProviderStatusCard name="Anthropic" envKey="VITE_ANTHROPIC_API_KEY" doc="chat" />
        <ProviderStatusCard name="Google (Gemini)" envKey="VITE_GOOGLE_API_KEY" doc="chat" />
        <ProviderStatusCard name="DeepSeek" envKey="VITE_DEEPSEEK_API_KEY" doc="chat" />
        <ProviderStatusCard
          name="Llama Local"
          envKey="VITE_LLAMA_BASE_URL"
          doc="local http endpoint"
        />
      </div>

      <div className="space-y-3">
        <div className="font-semibold">Per-Task Models</div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {TASKS.map((t) => {
            const cur = settings.perTask[t.id]
            return (
              <div key={t.id} className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">{t.label}</div>
                <Select
                  value={cur?.provider ?? 'openai'}
                  onValueChange={(prov: AIProviderId) =>
                    setModelForTask(t.id, {
                      provider: prov,
                      model: guessDefaultModel(prov, t.id),
                      kind: t.id === 'embed' ? 'embed' : t.id === 'moderate' ? 'moderate' : 'chat',
                      maxTokens: 8000,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={cur?.model ?? ''}
                  onChange={(e) =>
                    setModelForTask(t.id, {
                      ...(cur ?? {
                        provider: 'openai',
                        kind:
                          t.id === 'embed' ? 'embed' : t.id === 'moderate' ? 'moderate' : 'chat',
                      }),
                      model: e.target.value,
                    })
                  }
                  placeholder="Model name (e.g., gpt-4o-mini)"
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2 rounded-md border p-3">
          <div className="font-semibold">Defaults</div>
          <div className="grid grid-cols-3 items-center gap-2">
            <Label>Temperature</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.defaults.temperature}
              onChange={(e) => setDefaults({ temperature: Number(e.target.value) })}
              className="col-span-2"
            />
            <Label>Timeout (ms)</Label>
            <Input
              type="number"
              value={settings.defaults.timeoutMs}
              onChange={(e) => setDefaults({ timeoutMs: Number(e.target.value) })}
              className="col-span-2"
            />
            <Label>Retries</Label>
            <Input
              type="number"
              value={settings.defaults.retryAttempts}
              onChange={(e) => setDefaults({ retryAttempts: Number(e.target.value) })}
              className="col-span-2"
            />
          </div>
        </div>

        <div className="space-y-2 rounded-md border p-3">
          <div className="font-semibold">Toggles</div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.enableSafety}
                onChange={(e) => setToggles({ enableSafety: e.target.checked })}
              />
              Safety
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.enableCache}
                onChange={(e) => setToggles({ enableCache: e.target.checked })}
              />
              Cache
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.showMeters}
                onChange={(e) => setToggles({ showMeters: e.target.checked })}
              />
              Show meters
            </label>
            <div className="flex items-center gap-2 text-sm">
              <Label>Cache TTL (ms)</Label>
              <Input
                className="w-32"
                type="number"
                value={settings.cacheTTLms}
                onChange={(e) => setToggles({ cacheTTLms: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="outline" onClick={reset}>
              Reset Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function guessDefaultModel(provider: AIProviderId, task: AITask): string {
  if (task === 'embed') {
    return provider === 'openai' ? 'text-embedding-3-small' : 'embed-lite'
  }
  if (task === 'moderate') {
    return provider === 'openai' ? 'omni-moderation-latest' : 'mod-simple'
  }
  if (provider === 'anthropic') return 'claude-3-5-sonnet-20241022'
  if (provider === 'google') return 'gemini-1.5-pro'
  if (provider === 'deepseek') return 'deepseek-chat'
  if (provider === 'llama-local') return 'llama3:instruct'
  return 'gpt-4o-mini'
}
