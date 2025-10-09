/**
 * @fileoverview Recruiter pipeline Kanban board
 * @module components/network/PipelineBoard
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePipeline } from '@/stores/pipeline.store';
import { useContacts } from '@/stores/contacts.store';
import { PipelineSidePanel } from './PipelineSidePanel';
import type { PipelineStage } from '@/stores/pipeline.store';

export function PipelineBoard() {
  const { t } = useTranslation();
  const { items, byStage } = usePipeline();
  const { getById } = useContacts();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stages: PipelineStage[] = ['prospect', 'intro_requested', 'referred', 'screening', 'in_process', 'offer', 'closed'];

  return (
    <div className="flex gap-4">
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
          {stages.map(stage => {
            const stageItems = byStage(stage);
            return (
              <div key={stage} className="w-80 flex-shrink-0">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {t(`network.kanban.${stage}`)}
                      </CardTitle>
                      <Badge variant="secondary">{stageItems.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stageItems.map(item => {
                      const contact = getById(item.contactId);
                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => setSelectedId(item.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(item.id); }}
                        >
                          <div className="font-medium text-sm">{contact?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{item.company}</div>
                          <div className="text-xs text-muted-foreground">{item.role}</div>
                          {item.score && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                Score: {(item.score * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {stageItems.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No items
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {selectedId && (
        <PipelineSidePanel
          itemId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
