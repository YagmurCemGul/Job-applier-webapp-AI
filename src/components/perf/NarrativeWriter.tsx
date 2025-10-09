/**
 * Narrative Writer Component
 * 
 * AI-powered self-review narrative generation with bias detection.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePerf } from '@/stores/perf.store';
import { writeNarrative } from '@/services/perf/narrative.service';
import { Sparkles, Save, ShieldCheck } from 'lucide-react';

/**
 * Narrative writer with AI assistance and bias guard.
 */
export function NarrativeWriter() {
  const { t } = useTranslation();
  const { narratives, responses, graph } = usePerf();
  const [title, setTitle] = useState('');
  const [bullets, setBullets] = useState('');
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [html, setHtml] = useState('');

  const availableQuotes = responses.flatMap((r) => r.quotes || []);
  const availableGoals = Array.from(new Set(graph.map((g) => g.goalId)));

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const doc = await writeNarrative({
        title: title || 'Self-Review Narrative',
        bullets: bullets.split('\n').filter(Boolean),
        quotes: selectedQuotes,
        goalIds: selectedGoalIds,
      });
      setHtml(doc.html);
      usePerf.getState().upsertNarrative(doc);
    } catch (err) {
      console.error('Failed to generate narrative:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    const doc = {
      id: crypto.randomUUID(),
      title: title || 'Self-Review Narrative',
      html,
      lastEditedISO: new Date().toISOString(),
    };
    usePerf.getState().upsertNarrative(doc);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Narrative Writer</h2>
        <Badge variant="outline" className="gap-1">
          <ShieldCheck className="h-3 w-3" />
          Bias Guard Active
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="H2 2025 Self-Review"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bullets">Key Bullets (one per line)</Label>
            <Textarea
              id="bullets"
              value={bullets}
              onChange={(e) => setBullets(e.target.value)}
              placeholder="Reduced latency by 30%&#10;Led cross-team migration&#10;Mentored 3 junior engineers"
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Select Quotes (optional)</Label>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded border p-2">
              {availableQuotes.map((q, i) => (
                <label key={i} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedQuotes.includes(q)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQuotes([...selectedQuotes, q]);
                      } else {
                        setSelectedQuotes(selectedQuotes.filter((sq) => sq !== q));
                      }
                    }}
                    className="mt-0.5"
                  />
                  <span className="flex-1">&ldquo;{q}&rdquo;</span>
                </label>
              ))}
              {availableQuotes.length === 0 && (
                <p className="text-muted-foreground">No quotes available</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Select Goals (optional)</Label>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded border p-2">
              {availableGoals.map((gId) => (
                <label key={gId} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedGoalIds.includes(gId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGoalIds([...selectedGoalIds, gId]);
                      } else {
                        setSelectedGoalIds(selectedGoalIds.filter((id) => id !== gId));
                      }
                    }}
                  />
                  <span>{gId.slice(0, 12)}...</span>
                </label>
              ))}
              {availableGoals.length === 0 && (
                <p className="text-muted-foreground">No goals linked</p>
              )}
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating || !bullets}>
            <Sparkles className="mr-2 h-4 w-4" />
            {generating ? 'Generating...' : 'Suggest Narrative'}
          </Button>
        </CardContent>
      </Card>

      {html && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Narrative</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Version
              </Button>
              <Button variant="outline" onClick={() => setHtml('')}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {narratives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Narratives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {narratives.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setHtml(n.html)}
                  className="w-full rounded border p-2 text-left transition-colors hover:border-primary"
                >
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(n.lastEditedISO).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
