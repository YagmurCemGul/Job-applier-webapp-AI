/**
 * Job Card
 * Step 32 - Individual job posting display with match score
 */

import type { JobNormalized } from '@/types/jobs.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVariantsStore } from '@/stores/variants.store';
import { useEffect } from 'react';
import { useJobsStore } from '@/stores/jobs.store';
import { useATSStore } from '@/stores/ats.store';

interface JobCardProps {
  job: JobNormalized;
}

export default function JobCard({ job }: JobCardProps) {
  const { activeId } = useVariantsStore();
  const { updateScore } = useJobsStore();
  const { result } = useATSStore();
  const missing = new Set(result?.missingKeywords ?? []);

  useEffect(() => {
    // Simple match score: title/company overlap with active variant skills
    async function run() {
      try {
        const { useCVDataStore } = await import('@/stores/cvData.store');
        const cv = useCVDataStore.getState().cvData;
        if (!cv) return;
        
        const haystack = `${job.title} ${job.company} ${job.descriptionText}`.toLowerCase();
        const needles = (cv.skills ?? []).map((s: string) => s.toLowerCase());
        const hits = needles.filter(n => haystack.includes(n)).length;
        const score = Math.min(1, hits / Math.max(3, needles.length || 1));
        
        updateScore(job.id, score);
      } catch (e) {
        // Graceful fallback if cvData.store doesn't exist yet
        console.debug('CV store not available for match scoring', e);
      }
    }
    run();
  }, [activeId, job.id, updateScore]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 space-y-2">
        <div className="font-medium">{job.title}</div>
        
        <div className="text-xs text-muted-foreground">
          {job.company} • {job.location} {job.remote ? '• Remote' : ''}
        </div>
        
        {job.score !== undefined && (
          <div className="text-xs">
            Match: {(job.score * 100 | 0)}%
          </div>
        )}
        
        <div className="text-xs line-clamp-3">
          {job.descriptionText}
        </div>
        
        {!!missing.size && (
          <div className="flex flex-wrap gap-1">
            {[...missing].slice(0, 6).map(k => (
              <span 
                key={k} 
                className="px-1 py-0.5 text-[10px] rounded-full border"
              >
                {k}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={job.url} target="_blank" rel="noreferrer">
              Open
            </a>
          </Button>
          <Button size="sm" variant="outline">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
