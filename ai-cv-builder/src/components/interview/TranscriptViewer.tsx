/**
 * Transcript Viewer Component
 * Displays transcript segments with search and AI highlights
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Transcript } from '@/types/transcript.types';
import { Search, ChevronDown, ChevronUp, User, Briefcase, Sparkles } from 'lucide-react';

interface Props {
  transcript: Transcript;
}

export default function TranscriptViewer({ transcript }: Props) {
  const [search, setSearch] = useState('');
  const [showAI, setShowAI] = useState(true);

  const filtered = useMemo(() => {
    if (!search.trim()) return transcript.segments;
    const query = search.toLowerCase();
    return transcript.segments.filter(s => s.text.toLowerCase().includes(query));
  }, [transcript.segments, search]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerIcon = (speaker: string) => {
    if (speaker === 'Candidate') return <User className="w-4 h-4" />;
    if (speaker === 'Interviewer') return <Briefcase className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search transcript..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* AI Summary */}
      {transcript.ai && (
        <Collapsible open={showAI} onOpenChange={setShowAI}>
          <Card className="p-4 bg-primary/5 border-primary/20">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold">AI Insights</span>
                </div>
                {showAI ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-4 space-y-4">
              {transcript.ai.summary && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{transcript.ai.summary}</p>
                </div>
              )}

              {transcript.ai.star && transcript.ai.star.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">STAR Stories</h4>
                  <div className="space-y-2">
                    {transcript.ai.star.map((story, i) => (
                      <Card key={i} className="p-3 text-xs">
                        <div><strong>Situation:</strong> {story.situation}</div>
                        <div><strong>Task:</strong> {story.task}</div>
                        <div><strong>Action:</strong> {story.action}</div>
                        <div><strong>Result:</strong> {story.result}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {transcript.ai.strengths && transcript.ai.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Strengths</h4>
                  <div className="flex flex-wrap gap-1">
                    {transcript.ai.strengths.map((s, i) => (
                      <Badge key={i} variant="default">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {transcript.ai.concerns && transcript.ai.concerns.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Concerns</h4>
                  <div className="flex flex-wrap gap-1">
                    {transcript.ai.concerns.map((c, i) => (
                      <Badge key={i} variant="secondary">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {transcript.ai.riskFlags && transcript.ai.riskFlags.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Risk Flags</h4>
                  <div className="flex flex-wrap gap-1">
                    {transcript.ai.riskFlags.map((r, i) => (
                      <Badge key={i} variant="destructive">{r}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Segments */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filtered.length} {filtered.length === 1 ? 'segment' : 'segments'}
          </span>
          <span>Language: {transcript.language.toUpperCase()}</span>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.map(seg => (
            <Card key={seg.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                  {getSpeakerIcon(seg.speaker)}
                  <span className="text-xs text-muted-foreground">
                    {formatTime(seg.atMs)}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {seg.speaker}
                    </Badge>
                  </div>
                  <p className="text-sm">{seg.text}</p>
                </div>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No segments match your search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
