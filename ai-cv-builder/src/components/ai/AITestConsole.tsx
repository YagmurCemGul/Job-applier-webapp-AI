/**
 * AI Test Console Component
 * Quick testing interface for AI functionality
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { aiRoute } from "@/services/ai/router.service";

export default function AITestConsole() {
  const [input, setInput] = useState('Say hello in one sentence.');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const r = await aiRoute({ task: 'generate', prompt: input }, { allowCache: true });
      setOut((r.text || '') + (r.cached ? ' (cached)' : ''));
    } catch (e: any) {
      setOut(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-md p-3 space-y-2">
      <div className="font-semibold">AI Test Console</div>
      <Textarea rows={3} value={input} onChange={(e)=>setInput(e.target.value)} />
      <Button onClick={handleRun} disabled={loading}>
        {loading ? 'Running...' : 'Run'}
      </Button>
      <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded">{out}</pre>
    </div>
  );
}
