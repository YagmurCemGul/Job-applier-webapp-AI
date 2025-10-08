/**
 * @fileoverview Self-review composer with AI assistance
 * Generates STAR-formatted reviews grounded in impact evidence
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReviews } from '@/stores/review.store';
import { generateSelfReview } from '@/services/review/selfReviewAI.service';

interface SelfReviewComposerProps {
  cycleId: string;
}

/**
 * Generate using generateSelfReview; show clarity score and word count;
 * strong-verb chips; quick insert impact bullet; switch EN/TR; save to store
 */
export function SelfReviewComposer({ cycleId }: SelfReviewComposerProps) {
  const { t } = useTranslation();
  const { impactsByCycle, selfByCycle, upsertSelfReview } = useReviews();
  const impacts = impactsByCycle(cycleId);
  const existing = selfByCycle(cycleId);
  
  const [lang, setLang] = useState<'en' | 'tr'>(existing?.lang ?? 'en');
  const [overview, setOverview] = useState(existing?.overview ?? '');
  const [highlights, setHighlights] = useState(existing?.highlights ?? []);
  const [growthAreas, setGrowthAreas] = useState(existing?.growthAreas ?? []);
  const [nextObjectives, setNextObjectives] = useState(existing?.nextObjectives ?? []);
  const [generating, setGenerating] = useState(false);
  
  const wordCount = [overview, ...highlights, ...growthAreas, ...nextObjectives].join(' ').trim().split(/\s+/).length;
  const clarityScore = Math.max(0.1, Math.min(1, 1 - (wordCount / 900)));
  
  useEffect(() => {
    if (existing) {
      setLang(existing.lang);
      setOverview(existing.overview);
      setHighlights(existing.highlights);
      setGrowthAreas(existing.growthAreas);
      setNextObjectives(existing.nextObjectives);
    }
  }, [existing]);
  
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const review = await generateSelfReview(cycleId, lang, impacts);
      setOverview(review.overview);
      setHighlights(review.highlights);
      setGrowthAreas(review.growthAreas);
      setNextObjectives(review.nextObjectives);
    } finally {
      setGenerating(false);
    }
  };
  
  const handleSave = () => {
    upsertSelfReview({
      id: existing?.id ?? crypto.randomUUID(),
      cycleId,
      lang,
      overview,
      highlights,
      growthAreas,
      nextObjectives,
      wordCount,
      clarityScore,
      generatedAt: existing?.generatedAt,
      updatedAt: new Date().toISOString(),
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={lang} onValueChange={(v: 'en' | 'tr') => setLang(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="tr">Türkçe</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-sm text-muted-foreground">
            {t('review.wordCount', 'Word Count')}: <strong>{wordCount}</strong>
            {' • '}
            {t('review.clarity', 'Clarity')}: <strong>{Math.round(clarityScore * 100)}%</strong>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generating || impacts.length === 0}
          >
            <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
            {generating ? t('common.generating', 'Generating...') : t('review.generateAI', 'Generate AI')}
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('common.save', 'Save')}
          </Button>
        </div>
      </div>
      
      {impacts.length === 0 && (
        <div className="flex items-center gap-2 p-3 border border-amber-500 bg-amber-50 dark:bg-amber-950 rounded-md text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <p className="text-amber-800 dark:text-amber-200">
            {t('review.noImpactsForAI', 'No impact entries found. Add impacts to generate AI review.')}
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="overview">{t('review.overview', 'Overview')} (3-5 sentences)</Label>
          <Textarea
            id="overview"
            value={overview}
            onChange={e => setOverview(e.target.value)}
            rows={4}
            placeholder={t('review.overviewPlaceholder', 'Summarize your key contributions...')}
          />
        </div>
        
        <div className="space-y-2">
          <Label>{t('review.highlights', 'Highlights')} (4-7 bullets with metrics)</Label>
          {highlights.map((h, idx) => (
            <Textarea
              key={idx}
              value={h}
              onChange={e => {
                const updated = [...highlights];
                updated[idx] = e.target.value;
                setHighlights(updated);
              }}
              rows={2}
              placeholder={`Highlight ${idx + 1}`}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHighlights([...highlights, ''])}
          >
            {t('common.add', 'Add')}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label>{t('review.growthAreas', 'Growth Areas')} (2-4 bullets)</Label>
          {growthAreas.map((g, idx) => (
            <Textarea
              key={idx}
              value={g}
              onChange={e => {
                const updated = [...growthAreas];
                updated[idx] = e.target.value;
                setGrowthAreas(updated);
              }}
              rows={2}
              placeholder={`Growth area ${idx + 1}`}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGrowthAreas([...growthAreas, ''])}
          >
            {t('common.add', 'Add')}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label>{t('review.nextObjectives', 'Next Objectives')} (3-5 bullets)</Label>
          {nextObjectives.map((n, idx) => (
            <Textarea
              key={idx}
              value={n}
              onChange={e => {
                const updated = [...nextObjectives];
                updated[idx] = e.target.value;
                setNextObjectives(updated);
              }}
              rows={2}
              placeholder={`Objective ${idx + 1}`}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNextObjectives([...nextObjectives, ''])}
          >
            {t('common.add', 'Add')}
          </Button>
        </div>
      </div>
    </div>
  );
}
