/**
 * AI Settings Panel Component
 * Main configuration interface for AI orchestration
 */
import type { AITask } from "@/types/ai.types";
import { useAIStore } from "@/stores/ai.store";
import ProviderStatusCard from "./ProviderStatusCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const TASKS = [
  { id: 'parse', label: 'Parsing' },
  { id: 'generate', label: 'General Generation' },
  { id: 'match', label: 'Job Matching' },
  { id: 'coverLetter', label: 'Cover Letter' },
  { id: 'suggest', label: 'Keyword Suggest' },
  { id: 'embed', label: 'Embeddings' },
  { id: 'moderate', label: 'Moderation' }
] as const;

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'google', label: 'Google' },
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'llama-local', label: 'Llama (Local)' }
] as const;

export default function AISettingsPanel() {
  const { settings, setModelForTask, setDefaults, setToggles, reset } = useAIStore();

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <ProviderStatusCard name="OpenAI" envKey="VITE_OPENAI_API_KEY" doc="chat, embed, moderation"/>
        <ProviderStatusCard name="Anthropic" envKey="VITE_ANTHROPIC_API_KEY" doc="chat"/>
        <ProviderStatusCard name="Google (Gemini)" envKey="VITE_GOOGLE_API_KEY" doc="chat"/>
        <ProviderStatusCard name="DeepSeek" envKey="VITE_DEEPSEEK_API_KEY" doc="chat"/>
        <ProviderStatusCard name="Llama Local" envKey="VITE_LLAMA_BASE_URL" doc="local http endpoint"/>
      </div>

      <div className="space-y-3">
        <div className="font-semibold">Per-Task Models</div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {TASKS.map(t => {
            const cur = settings.perTask[t.id as any];
            return (
              <div key={t.id} className="border rounded-md p-3 space-y-2">
                <div className="text-sm">{t.label}</div>
                <Select
                  value={cur?.provider ?? 'openai'}
                  onValueChange={(prov: string) => setModelForTask(t.id as AITask, { 
                    provider: prov as any, 
                    model: guessDefaultModel(prov, t.id as string), 
                    kind: t.id==='embed'?'embed':t.id==='moderate'?'moderate':'chat', 
                    maxTokens: 8000 
                  })}
                >
                  <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  value={cur?.model ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setModelForTask(t.id as AITask, { 
                    ...(cur ?? { provider: 'openai', kind: t.id==='embed'?'embed':t.id==='moderate'?'moderate':'chat' }), 
                    model: e.target.value 
                  })}
                  placeholder="Model name (e.g., gpt-4o-mini)"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="border rounded-md p-3 space-y-2">
          <div className="font-semibold">Defaults</div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label>Temperature</Label>
            <Input 
              type="number" 
              step="0.1" 
              value={settings.defaults.temperature} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDefaults({ temperature: Number(e.target.value) })} 
              className="col-span-2" 
            />
            <Label>Timeout (ms)</Label>
            <Input 
              type="number" 
              value={settings.defaults.timeoutMs} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDefaults({ timeoutMs: Number(e.target.value) })} 
              className="col-span-2" 
            />
            <Label>Retries</Label>
            <Input 
              type="number" 
              value={settings.defaults.retryAttempts} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDefaults({ retryAttempts: Number(e.target.value) })} 
              className="col-span-2" 
            />
          </div>
        </div>

        <div className="border rounded-md p-3 space-y-2">
          <div className="font-semibold">Toggles</div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={settings.enableSafety} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setToggles({ enableSafety: e.target.checked })} 
              /> Safety
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={settings.enableCache} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setToggles({ enableCache: e.target.checked })} 
              /> Cache
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={settings.showMeters} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setToggles({ showMeters: e.target.checked })} 
              /> Show meters
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Label>Cache TTL (ms)</Label>
            <Input 
              className="w-32" 
              type="number" 
              value={settings.cacheTTLms} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setToggles({ cacheTTLms: Number(e.target.value) })} 
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={reset}>Reset Defaults</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function guessDefaultModel(provider: string, task: string) {
  if (task === 'embed') return provider === 'openai' ? 'text-embedding-3-small' : 'embed-lite';
  if (task === 'moderate') return provider === 'openai' ? 'omni-moderation-latest' : 'mod-simple';
  if (provider === 'anthropic') return 'claude-3-5-sonnet-20241022';
  if (provider === 'google') return 'gemini-1.5-pro';
  if (provider === 'deepseek') return 'deepseek-chat';
  if (provider === 'llama-local') return 'llama3:instruct';
  return 'gpt-4o-mini';
}
