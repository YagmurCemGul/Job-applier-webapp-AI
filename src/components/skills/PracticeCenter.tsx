/**
 * Practice Center Component (Step 47)
 * Browse resources and create flashcards.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/stores/skills.store';
import { createCard } from '@/services/skills/spacedRep.service';
import { Book, Plus, ExternalLink } from 'lucide-react';
import type { LearningResource } from '@/types/skills.types';

/**
 * Practice Center with resource browser and flashcard creation.
 */
export function PracticeCenter() {
  const { t } = useTranslation();
  const { resources, upsertResource } = useSkills();
  const [showCardForm, setShowCardForm] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [competencyKey, setCompetencyKey] = useState('system_design');

  const handleCreateCard = () => {
    if (!front || !back) return;
    createCard({ competencyKey, front, back });
    setFront('');
    setBack('');
    setShowCardForm(false);
  };

  // Seed sample resources if none exist
  if (resources.length === 0) {
    const samples: LearningResource[] = [
      {
        id: crypto.randomUUID(),
        kind: 'course',
        title: 'System Design Fundamentals',
        url: 'https://example.com/course/system-design',
        estMinutes: 120,
        tags: ['architecture', 'scalability'],
        competencyKeys: ['system_design'],
        difficulty: 2
      },
      {
        id: crypto.randomUUID(),
        kind: 'video',
        title: 'Code Review Best Practices',
        url: 'https://example.com/video/code-review',
        estMinutes: 30,
        tags: ['quality', 'collaboration'],
        competencyKeys: ['coding', 'communication'],
        difficulty: 1
      }
    ];
    samples.forEach(r => upsertResource(r));
  }

  return (
    <div className="space-y-6">
      {/* Create Flashcard */}
      <Card>
        <CardHeader>
          <CardTitle>Create Flashcard</CardTitle>
        </CardHeader>
        <CardContent>
          {!showCardForm ? (
            <Button onClick={() => setShowCardForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Flashcard
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Competency</label>
                <Input
                  value={competencyKey}
                  onChange={e => setCompetencyKey(e.target.value)}
                  placeholder="e.g., system_design"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Front</label>
                <Input
                  value={front}
                  onChange={e => setFront(e.target.value)}
                  placeholder="Question or prompt"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Back</label>
                <Input
                  value={back}
                  onChange={e => setBack(e.target.value)}
                  placeholder="Answer or explanation"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateCard}>Create</Button>
                <Button variant="outline" onClick={() => setShowCardForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Browser */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resources.map(resource => (
              <div key={resource.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Book className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{resource.title}</h4>
                    <Badge variant="outline" className="capitalize">{resource.kind}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {resource.estMinutes}m • Difficulty: {resource.difficulty}/5
                  </p>
                  <div className="flex gap-2">
                    {resource.competencyKeys.map(key => (
                      <Badge key={key} variant="secondary" className="text-xs">{key}</Badge>
                    ))}
                  </div>
                </div>
                {resource.url && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
