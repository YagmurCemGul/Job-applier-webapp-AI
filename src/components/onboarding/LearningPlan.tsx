/**
 * @fileoverview Learning Plan component (Step 45)
 * @module components/onboarding/LearningPlan
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink } from 'lucide-react';
import { seedLearning } from '@/services/onboarding/learning.service';
import type { LearningItem, LearningKind } from '@/types/onboarding.types';

interface Props {
  items: LearningItem[];
  role?: string;
  onAdd: (item: LearningItem) => void;
  onUpdate: (id: string, patch: Partial<LearningItem>) => void;
  onLoadDefaults: () => void;
}

/**
 * Learning Plan - track learning resources
 */
export function LearningPlan({ items, role, onAdd, onUpdate, onLoadDefaults }: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<Partial<LearningItem>>({
    title: '',
    kind: 'doc',
    url: '',
    status: 'planned'
  });
  
  const handleAdd = () => {
    if (!editing.title?.trim()) return;
    
    onAdd({
      id: crypto.randomUUID(),
      kind: editing.kind as LearningKind,
      title: editing.title,
      url: editing.url,
      owner: editing.owner,
      status: 'planned'
    });
    
    setEditing({ title: '', kind: 'doc', url: '', status: 'planned' });
  };
  
  const kindIcon = (kind: LearningKind) => {
    switch (kind) {
      case 'course': return '🎓';
      case 'doc': return '📄';
      case 'repo': return '💻';
      case 'person': return '👤';
      case 'video': return '🎥';
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('onboard.learning')}</CardTitle>
            <Button onClick={onLoadDefaults} variant="outline" size="sm">
              Seed from Role
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Learning items */}
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-xl">{kindIcon(item.kind)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <Badge variant={item.kind === 'course' ? 'default' : 'secondary'}>
                    {item.kind}
                  </Badge>
                </div>
                <select
                  value={item.status}
                  onChange={(e) => onUpdate(item.id, { status: e.target.value as LearningItem['status'] })}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            ))}
          </div>
          
          {/* Add item */}
          <div className="border-t pt-4 space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Learning resource title..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <select
                  value={editing.kind}
                  onChange={(e) => setEditing({ ...editing, kind: e.target.value as LearningKind })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="doc">Document</option>
                  <option value="course">Course</option>
                  <option value="repo">Repository</option>
                  <option value="person">Person/Mentor</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <Label>URL (optional)</Label>
                <Input
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <Button onClick={handleAdd} size="sm" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Learning Item
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
